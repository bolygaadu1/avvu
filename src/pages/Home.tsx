import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Printer, FileText, CheckCircle, Clock, BookOpen, Image, Bookmark, Phone, Mail, MapPin } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselImages = [
    {
      url: "/images/1.jpg",
      alt: "Professional printing services"
    },
    {
      url: "/images/2.jpg",
      alt: "Modern printing equipment"
    },
    {
      url: "/images/3.jpg",
      alt: "Document printing"
    },
    {
      url: "/images/4.jpg",
      alt: "Print shop services"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-xerox-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Professional Printing Services On Demand
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-gray-600">
                Fast, affordable, high-quality printing solutions for all your needs. 
                Upload your files and we'll handle the rest.
              </p>
              <div className="mt-6 sm:mt-8">
                <Link to="/order">
                  <Button size="lg" className="bg-xerox-600 hover:bg-xerox-700 text-white w-full sm:w-auto">
                    Start your order
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center mt-8 lg:mt-0">
              <div className="w-full max-w-lg">
                <Carousel 
                  className="w-full"
                  selectedIndex={currentSlide}
                  setSelectedIndex={setCurrentSlide}
                >
                  <CarouselContent>
                    {carouselImages.map((image, index) => (
                      <CarouselItem key={index}>
                        <img 
                          src={image.url} 
                          alt={image.alt}
                          className="rounded-lg shadow-lg w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover" 
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              High-quality printing solutions for all your needs
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center">
                <Printer className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Printing</h3>
              <p className="mt-2 text-gray-600 text-sm">
                High-quality printing for documents, reports, presentations, and more.
              </p>
              <Link to="/order">
                <Button className="mt-4 w-full bg-xerox-600 hover:bg-xerox-700 text-white">
                  Order Now
                </Button>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Spiral Binding</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Professional spiral binding for documents, reports, and presentations.
              </p>
              <Link to="/order">
                <Button className="mt-4 w-full bg-xerox-600 hover:bg-xerox-700 text-white">
                  Order Now
                </Button>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center">
                <Bookmark className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Project Binding</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Complete project binding solutions for academic and professional needs.
              </p>
              <Link to="/order">
                <Button className="mt-4 w-full bg-xerox-600 hover:bg-xerox-700 text-white">
                  Order Now
                </Button>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">Photo Frame</h3>
              <p className="mt-2 text-gray-600 text-sm">
                Coming Soon! Professional photo framing services for your memories.
              </p>
              <Button className="mt-4 w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Simple 3-step process to get your documents printed
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-xerox-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">1. Upload Your Files</h3>
              <p className="mt-2 text-gray-600">
                Select and upload the files you want to print.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-xerox-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-8 w-8 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">2. Choose Options</h3>
              <p className="mt-2 text-gray-600">
                Select paper size, number of copies, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-xerox-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">3. Submit Order</h3>
              <p className="mt-2 text-gray-600">
                We'll process your order and have it ready for pickup.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <Link to="/order">
              <Button size="lg" className="bg-xerox-600 hover:bg-xerox-700 text-white w-full sm:w-auto">
                Place Your Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Contact Us</h2>
            <p className="mt-4 text-lg sm:text-xl text-gray-600">
              Get in touch with us for any queries or support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center mx-auto">
                <MapPin className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Address</h3>
              <p className="mt-2 text-gray-600 text-sm">
                ADB road near pragati engineering college<br />
                ramesampeta, surampalem
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center mx-auto">
                <Phone className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Phone</h3>
              <p className="mt-2 text-gray-600">
                <a href="tel:+916301526803" className="hover:text-xerox-600 transition-colors">
                  +91 6301526803
                </a>
              </p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-xerox-100 rounded-lg flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-xerox-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Email</h3>
              <p className="mt-2 text-gray-600">
                <a href="mailto:aishwaryaxerox1999@gmail.com" className="hover:text-xerox-600 transition-colors break-all">
                  aishwaryaxerox1999@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-12 sm:py-16 bg-xerox-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Ready to Start Your Print Job?</h2>
          <p className="mt-4 text-lg sm:text-xl">
            Fast, reliable printing services for your documents and files
          </p>
          <div className="mt-6 sm:mt-8">
            <Link to="/order">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-xerox-800 w-full sm:w-auto">
                Order Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;