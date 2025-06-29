import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4173;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve images from images directory
app.use('/images', express.static(path.join(__dirname, 'images')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Initialize SQLite database
const dbPath = path.join(__dirname, 'xerox_orders.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  // Orders table
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE NOT NULL,
      fullName TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      printType TEXT NOT NULL,
      bindingColorType TEXT,
      copies INTEGER,
      paperSize TEXT,
      printSide TEXT,
      selectedPages TEXT,
      colorPages TEXT,
      bwPages TEXT,
      specialInstructions TEXT,
      orderDate TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      totalCost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Files table
  db.run(`
    CREATE TABLE IF NOT EXISTS order_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      originalName TEXT NOT NULL,
      fileName TEXT NOT NULL,
      filePath TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      fileType TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (orderId)
    )
  `);

  // Admin sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sessionId TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `);
});

// API Routes

// Admin login
app.post('/api/admin/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { username, password } = req.body;
  
  // Simple hardcoded credentials (in production, use proper authentication)
  if (username === 'admin' && password === 'xerox123') {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    db.run(
      'INSERT INTO admin_sessions (sessionId, expires_at) VALUES (?, ?)',
      [sessionId, expiresAt.toISOString()],
      function(err) {
        if (err) {
          console.error('Error creating session:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        
        console.log('Login successful for admin');
        res.json({ 
          success: true, 
          sessionId: sessionId,
          message: 'Login successful' 
        });
      }
    );
  } else {
    console.log('Invalid credentials provided');
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

// Verify admin session
app.post('/api/admin/verify', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(401).json({ valid: false });
  }
  
  db.get(
    'SELECT * FROM admin_sessions WHERE sessionId = ? AND expires_at > datetime("now")',
    [sessionId],
    (err, row) => {
      if (err) {
        console.error('Error verifying session:', err);
        return res.status(500).json({ valid: false });
      }
      
      res.json({ valid: !!row });
    }
  );
});

// Submit order
app.post('/api/orders', upload.array('files'), (req, res) => {
  try {
    console.log('Received order submission');
    const orderData = JSON.parse(req.body.orderData);
    const files = req.files || [];
    
    const orderId = `ORD-${Date.now()}`;
    const orderDate = new Date().toISOString();
    
    console.log('Creating order:', orderId);
    
    // Insert order into database
    db.run(`
      INSERT INTO orders (
        orderId, fullName, phoneNumber, printType, bindingColorType,
        copies, paperSize, printSide, selectedPages, colorPages, bwPages,
        specialInstructions, orderDate, status, totalCost
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      orderData.fullName,
      orderData.phoneNumber,
      orderData.printType,
      orderData.bindingColorType || null,
      orderData.copies || null,
      orderData.paperSize || null,
      orderData.printSide || null,
      orderData.selectedPages || null,
      orderData.colorPages || null,
      orderData.bwPages || null,
      orderData.specialInstructions || null,
      orderDate,
      'pending',
      orderData.totalCost || 0
    ], function(err) {
      if (err) {
        console.error('Error inserting order:', err);
        return res.status(500).json({ error: 'Failed to create order' });
      }
      
      console.log('Order created successfully, processing files...');
      
      // Insert files
      const filePromises = files.map(file => {
        return new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO order_files (
              orderId, originalName, fileName, filePath, fileSize, fileType
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            orderId,
            file.originalname,
            file.filename,
            file.path,
            file.size,
            file.mimetype
          ], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      
      Promise.all(filePromises)
        .then(() => {
          console.log('Order and files saved successfully');
          res.json({
            success: true,
            orderId: orderId,
            message: 'Order submitted successfully'
          });
        })
        .catch(err => {
          console.error('Error inserting files:', err);
          res.status(500).json({ error: 'Failed to save files' });
        });
    });
    
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get all orders (admin only)
app.get('/api/orders', (req, res) => {
  const sessionId = req.headers.sessionid;
  
  // Verify admin session
  db.get(
    'SELECT * FROM admin_sessions WHERE sessionId = ? AND expires_at > datetime("now")',
    [sessionId],
    (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get all orders with their files
      db.all(`
        SELECT o.*, 
               GROUP_CONCAT(
                 json_object(
                   'name', f.originalName,
                   'size', f.fileSize,
                   'type', f.fileType,
                   'path', f.fileName
                 )
               ) as files
        FROM orders o
        LEFT JOIN order_files f ON o.orderId = f.orderId
        GROUP BY o.orderId
        ORDER BY o.created_at DESC
      `, (err, rows) => {
        if (err) {
          console.error('Error fetching orders:', err);
          return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        
        // Process the results
        const orders = rows.map(row => {
          let files = [];
          if (row.files) {
            try {
              files = row.files.split(',').map(f => JSON.parse(f));
            } catch (e) {
              console.error('Error parsing files:', e);
              files = [];
            }
          }
          
          return {
            orderId: row.orderId,
            fullName: row.fullName,
            phoneNumber: row.phoneNumber,
            printType: row.printType,
            bindingColorType: row.bindingColorType,
            copies: row.copies,
            paperSize: row.paperSize,
            printSide: row.printSide,
            selectedPages: row.selectedPages,
            colorPages: row.colorPages,
            bwPages: row.bwPages,
            specialInstructions: row.specialInstructions,
            orderDate: row.orderDate,
            status: row.status,
            totalCost: row.totalCost,
            files: files
          };
        });
        
        res.json(orders);
      });
    }
  );
});

// Get single order by ID
app.get('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  
  db.get('SELECT * FROM orders WHERE orderId = ?', [orderId], (err, order) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get files for this order
    db.all('SELECT * FROM order_files WHERE orderId = ?', [orderId], (err, files) => {
      if (err) {
        console.error('Error fetching files:', err);
        return res.status(500).json({ error: 'Failed to fetch files' });
      }
      
      const orderWithFiles = {
        ...order,
        files: files.map(f => ({
          name: f.originalName,
          size: f.fileSize,
          type: f.fileType,
          path: f.fileName
        }))
      };
      
      res.json(orderWithFiles);
    });
  });
});

// Update order status (admin only)
app.put('/api/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const sessionId = req.headers.sessionid;
  
  // Verify admin session
  db.get(
    'SELECT * FROM admin_sessions WHERE sessionId = ? AND expires_at > datetime("now")',
    [sessionId],
    (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      db.run(
        'UPDATE orders SET status = ? WHERE orderId = ?',
        [status, orderId],
        function(err) {
          if (err) {
            console.error('Error updating order status:', err);
            return res.status(500).json({ error: 'Failed to update order status' });
          }
          
          if (this.changes === 0) {
            return res.status(404).json({ error: 'Order not found' });
          }
          
          res.json({ success: true, message: 'Order status updated' });
        }
      );
    }
  );
});

// Download file
app.get('/api/files/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Clear all orders (admin only)
app.delete('/api/orders', (req, res) => {
  const sessionId = req.headers.sessionid;
  
  // Verify admin session
  db.get(
    'SELECT * FROM admin_sessions WHERE sessionId = ? AND expires_at > datetime("now")',
    [sessionId],
    (err, session) => {
      if (err || !session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Delete all files first
      db.all('SELECT filePath FROM order_files', (err, files) => {
        if (!err && files) {
          files.forEach(file => {
            try {
              if (fs.existsSync(file.filePath)) {
                fs.unlinkSync(file.filePath);
              }
            } catch (e) {
              console.error('Error deleting file:', e);
            }
          });
        }
        
        // Delete from database
        db.run('DELETE FROM order_files', (err) => {
          if (err) {
            console.error('Error deleting files from DB:', err);
          }
          
          db.run('DELETE FROM orders', (err) => {
            if (err) {
              console.error('Error deleting orders:', err);
              return res.status(500).json({ error: 'Failed to clear orders' });
            }
            
            res.json({ success: true, message: 'All orders cleared' });
          });
        });
      });
    }
  );
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database path: ${dbPath}`);
  console.log(`Uploads directory: ${uploadsDir}`);
});