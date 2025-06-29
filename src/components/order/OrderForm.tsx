import React, { useState, useEffect } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FileUploader from './FileUploader';
import { CheckCircle, Copy, Phone, Mail, Calculator, FileText, Clock } from "lucide-react";
import { toast } from "sonner";
import { apiService } from '@/services/api';

const orderSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }),
  printType: z.string(),
  bindingColorType: z.string().optional(),
  copies: z.coerce.number().min(1).optional(),
  paperSize: z.string().optional(),
  printSide: z.string().optional(),
  selectedPages: z.string().optional(),
  colorPages: z.string().optional(),
  bwPages: z.string().optional(),
  specialInstructions: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const OrderForm = () => {
  const { toast: showToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedOrderId, setSubmittedOrderId] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState('all');
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [isCustomPrint, setIsCustomPrint] = useState(false);
  const [isBindingType, setIsBindingType] = useState(false);
  const [isCustomPrintType, setIsCustomPrintType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      printType: "blackAndWhite",
      bindingColorType: "blackAndWhite",
      copies: 1,
      paperSize: "a4",
      printSide: "single",
      selectedPages: "all",
      colorPages: "",
      bwPages: "",
      specialInstructions: "",
    },
  });

  const calculateSelectedPagesCount = (selectedPagesStr: string, totalPages: number): number => {
    if (selectedPagesStr === 'all') {
      return totalPages;
    }

    const pageRanges = selectedPagesStr.split(',').map(range => range.trim());
    let selectedPagesCount = 0;

    for (const range of pageRanges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          selectedPagesCount += (end - start + 1);
        }
      } else {
        const page = Number(range);
        if (!isNaN(page)) {
          selectedPagesCount += 1;
        }
      }
    }

    return selectedPagesCount;
  };

  const calculateSpiralBindingCost = (totalPages: number): number => {
    if (totalPages <= 50) {
      return 25;
    } else if (totalPages <= 70) {
      return 30;
    } else if (totalPages <= 90) {
      return 35;
    } else {
      const extraPages = totalPages - 90;
      const extraGroups = Math.ceil(extraPages / 20);
      return 35 + (extraGroups * 5);
    }
  };

  const calculateCost = (values: OrderFormValues) => {
    if (values.printType === 'customPrint') {
      setCalculatedCost(0);
      return 0;
    }

    const isDoubleSided = values.printSide === 'double';
    const copies = values.copies || 1;
    const printType = values.printType;
    const bindingColorType = values.bindingColorType;
    
    let totalCost = 0;
    
    if (bindingColorType === 'custom' && isBindingType) {
      if (values.colorPages) {
        const colorPageRanges = values.colorPages.split(',').map(range => range.trim());
        let colorPagesCount = 0;
        
        for (const range of colorPageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              colorPagesCount += (end - start + 1);
            }
          } else {
            const page = Number(range);
            if (!isNaN(page)) {
              colorPagesCount += 1;
            }
          }
        }
        
        const colorCostPerPage = isDoubleSided ? 13 : 8;
        totalCost += colorPagesCount * colorCostPerPage;
      }
      
      if (values.bwPages) {
        const bwPageRanges = values.bwPages.split(',').map(range => range.trim());
        let bwPagesCount = 0;
        
        for (const range of bwPageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              bwPagesCount += (end - start + 1);
            }
          } else {
            const page = Number(range);
            if (!isNaN(page)) {
              bwPagesCount += 1;
            }
          }
        }
        
        const bwCostPerPage = isDoubleSided ? 1.6 : 1.5;
        totalCost += bwPagesCount * bwCostPerPage;
      }
    } else if (values.printType === 'custom') {
      if (values.colorPages) {
        const colorPageRanges = values.colorPages.split(',').map(range => range.trim());
        let colorPagesCount = 0;
        
        for (const range of colorPageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              colorPagesCount += (end - start + 1);
            }
          } else {
            const page = Number(range);
            if (!isNaN(page)) {
              colorPagesCount += 1;
            }
          }
        }
        
        const colorCostPerPage = isDoubleSided ? 13 : 8;
        totalCost += colorPagesCount * colorCostPerPage;
      }
      
      if (values.bwPages) {
        const bwPageRanges = values.bwPages.split(',').map(range => range.trim());
        let bwPagesCount = 0;
        
        for (const range of bwPageRanges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            if (!isNaN(start) && !isNaN(end) && start <= end) {
              bwPagesCount += (end - start + 1);
            }
          } else {
            const page = Number(range);
            if (!isNaN(page)) {
              bwPagesCount += 1;
            }
          }
        }
        
        const bwCostPerPage = isDoubleSided ? 1.6 : 1.5;
        totalCost += bwPagesCount * bwCostPerPage;
      }
    } else if (printType === 'softBinding' || printType === 'spiralBinding') {
      let pagesCount = calculateSelectedPagesCount(values.selectedPages || 'all', totalPages);
      let costPerPage;
      
      if (bindingColorType === 'color') {
        costPerPage = isDoubleSided ? 13 : 8;
      } else {
        costPerPage = isDoubleSided ? 1.6 : 1.5;
      }
      
      let effectivePages = pagesCount;
      if (isDoubleSided) {
        effectivePages = Math.ceil(pagesCount / 2);
      }
      
      totalCost = effectivePages * costPerPage;
      
      if (printType === 'softBinding') {
        totalCost += 25;
      } else if (printType === 'spiralBinding') {
        totalCost += calculateSpiralBindingCost(pagesCount);
      }
    } else {
      const isColor = values.printType === 'color';
      let pagesCount = calculateSelectedPagesCount(values.selectedPages || 'all', totalPages);
      
      let costPerPage;
      if (isColor) {
        costPerPage = isDoubleSided ? 13 : 8;
      } else {
        costPerPage = isDoubleSided ? 1.6 : 1.5;
      }
      
      let effectivePages = pagesCount;
      if (isDoubleSided) {
        effectivePages = Math.ceil(pagesCount / 2);
      }
      
      totalCost = effectivePages * costPerPage;
    }
    
    totalCost *= copies;
    setCalculatedCost(totalCost);
    return totalCost;
  };

  const handleFilesChange = (uploadedFiles: File[]) => {
    setFiles(uploadedFiles);
  };

  const handlePageCountChange = (pageCount: number) => {
    setTotalPages(pageCount);
    form.setValue('selectedPages', `1-${pageCount}`);
    calculateCost(form.getValues());
  };

  const handlePageRangeChange = (pageRange: string) => {
    form.setValue('selectedPages', pageRange);
    calculateCost(form.getValues());
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(submittedOrderId);
    toast.success("Order ID copied to clipboard!");
  };

  const validatePageSelection = (input: string, totalPages: number): boolean => {
    if (input === 'all') return true;
    
    const pageRanges = input.split(',').map(range => range.trim());
    for (const range of pageRanges) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
          return false;
        }
      } else {
        const page = Number(range);
        if (isNaN(page) || page < 1 || page > totalPages) {
          return false;
        }
      }
    }
    return true;
  };

  const onSubmit = async (data: OrderFormValues) => {
    if (files.length === 0) {
      showToast({
        title: "No files selected",
        description: "Please upload at least one file to print.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (data.printType === 'customPrint') {
        const orderData = {
          ...data,
          totalCost: 0,
          copies: 1,
          paperSize: 'a4',
          printSide: 'single',
          selectedPages: 'all',
        };

        const response = await apiService.submitOrder(orderData, files);
        setSubmittedOrderId(response.orderId);
        setOrderSubmitted(true);

        showToast({
          title: "Order submitted successfully!",
          description: `Your order ID is ${response.orderId}`,
        });
        return;
      }

      if (data.printType === 'custom' || (isBindingType && data.bindingColorType === 'custom')) {
        if (!data.colorPages && !data.bwPages) {
          showToast({
            title: "Page selection required",
            description: "Please specify either color or black & white pages.",
            variant: "destructive",
          });
          return;
        }
      } else if (!validatePageSelection(data.selectedPages || 'all', totalPages)) {
        showToast({
          title: "Invalid page selection",
          description: "Please check your page selection.",
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        ...data,
        totalCost: calculatedCost,
      };

      const response = await apiService.submitOrder(orderData, files);
      setSubmittedOrderId(response.orderId);
      setOrderSubmitted(true);

      showToast({
        title: "Order submitted successfully!",
        description: `Your order ID is ${response.orderId}`,
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      showToast({
        title: "Error submitting order",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startNewOrder = () => {
    setOrderSubmitted(false);
    setSubmittedOrderId('');
    setFiles([]);
    setTotalPages(0);
    setCalculatedCost(0);
    setIsCustomPrint(false);
    setIsBindingType(false);
    setIsCustomPrintType(false);
    form.reset();
  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (totalPages > 0 && value.printType !== 'customPrint') {
        calculateCost(value as OrderFormValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, totalPages]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'printType') {
        const printType = value.printType;
        setIsCustomPrint(printType === 'custom');
        setIsBindingType(printType === 'softBinding' || printType === 'spiralBinding');
        setIsCustomPrintType(printType === 'customPrint');
        
        if (printType !== 'custom') {
          form.setValue('colorPages', '');
          form.setValue('bwPages', '');
        }
        
        if (printType !== 'softBinding' && printType !== 'spiralBinding') {
          form.setValue('bindingColorType', 'blackAndWhite');
        }
      }
      
      if (name === 'bindingColorType') {
        const bindingColorType = value.bindingColorType;
        setIsCustomPrint(bindingColorType === 'custom');
        
        if (bindingColorType !== 'custom') {
          form.setValue('colorPages', '');
          form.setValue('bwPages', '');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  if (orderSubmitted) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-green-500" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-green-800">Order Submitted Successfully!</CardTitle>
            <CardDescription className="text-green-700">
              Your print job has been received and will be processed soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-3 text-center">Your Order ID</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <span className="text-lg sm:text-2xl font-mono font-bold text-xerox-700 select-all break-all text-center">
                  {submittedOrderId}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOrderId}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="text-sm text-gray-600 text-center mt-3">
                Save this Order ID to track your order status
              </p>
            </div>

            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h4 className="font-semibold text-blue-900 text-base sm:text-lg">Quick Response Guarantee</h4>
              </div>
              <p className="text-blue-800 text-center text-base sm:text-lg font-medium">
                Our Admin Will Contact You Within 10 Minutes
              </p>
              <p className="text-blue-700 text-center text-sm mt-2">
                We'll call you to confirm your order details and provide pickup information.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">What's Next?</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• We'll process your order and prepare your prints</li>
                <li>• You can track your order status using the Order ID above</li>
                <li>• We'll contact you when your order is ready for pickup</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+91 6301526803</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">aishwaryaxerox1999@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={startNewOrder}
                className="flex-1 bg-xerox-600 hover:bg-xerox-700"
              >
                Place Another Order
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.open('/track', '_blank')}
                className="flex-1"
              >
                Track This Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="printType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Print Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setIsCustomPrint(value === 'custom');
                        setIsBindingType(value === 'softBinding' || value === 'spiralBinding');
                        setIsCustomPrintType(value === 'customPrint');
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select print type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="blackAndWhite">Black & White</SelectItem>
                        <SelectItem value="color">Color</SelectItem>
                        <SelectItem value="custom">Custom (Mix Color & B/W)</SelectItem>
                        <SelectItem value="softBinding">Soft Binding</SelectItem>
                        <SelectItem value="spiralBinding">Spiral Binding</SelectItem>
                        <SelectItem value="customPrint">Custom Print (Quote Required)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isBindingType && (
                <FormField
                  control={form.control}
                  name="bindingColorType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Binding Color Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setIsCustomPrint(value === 'custom');
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select color type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="blackAndWhite">Black & White</SelectItem>
                          <SelectItem value="color">Color</SelectItem>
                          <SelectItem value="custom">Custom (Mix Color & B/W)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {!isCustomPrintType && (
                <>
                  <FormField
                    control={form.control}
                    name="printSide"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Print Side</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select side" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="single">Single Side</SelectItem>
                            <SelectItem value="double">Double Side</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="copies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Copies</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {!isCustomPrintType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paperSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paper Size</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="a4">A4</SelectItem>
                          <SelectItem value="a3">A3</SelectItem>
                          <SelectItem value="letter">Letter</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isCustomPrint && (
                  <FormField
                    control={form.control}
                    name="selectedPages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Page Selection</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 1-5, 8, 11-13 or 'all'" 
                            {...field}
                            disabled={totalPages === 0}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const newValues = form.getValues();
                              newValues.selectedPages = e.target.value;
                              calculateCost(newValues);
                            }}
                          />
                        </FormControl>
                        <p className="text-sm text-gray-500">
                          {totalPages > 0 ? `Total pages: ${totalPages}` : 'Upload a file to select pages'}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {isCustomPrint && (
                  <>
                    <FormField
                      control={form.control}
                      name="colorPages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Pages</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 1-3, 5, 7-9" 
                              {...field}
                              disabled={totalPages === 0}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateCost(form.getValues());
                              }}
                            />
                          </FormControl>
                          <p className="text-sm text-gray-500">
                            Specify pages to print in color
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bwPages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Black & White Pages</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 4, 6, 10-12" 
                              {...field}
                              disabled={totalPages === 0}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateCost(form.getValues());
                              }}
                            />
                          </FormControl>
                          <p className="text-sm text-gray-500">
                            Specify pages to print in black & white
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="specialInstructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any special instructions here..." 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Upload Files</h3>
            <FileUploader 
              onFilesChange={handleFilesChange} 
              onPageCountChange={handlePageCountChange}
              onPageRangeChange={handlePageRangeChange}
            />

            {files.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files Preview</h4>
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-xerox-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {calculatedCost > 0 && !isCustomPrintType && (
            <Card className="bg-xerox-50 border-xerox-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-xerox-600" />
                    <h3 className="font-medium text-xerox-900">Estimated Cost</h3>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-xerox-700">
                    ₹{calculatedCost.toFixed(2)}
                  </p>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {!isCustomPrint && !isBindingType && (
                    <>
                      <p>• Selected pages: {form.getValues('selectedPages')}</p>
                      <p>• {getPrintTypeDisplayName(form.getValues('printType'))} printing</p>
                    </>
                  )}
                  {isBindingType && !isCustomPrint && (
                    <>
                      <p>• Selected pages: {form.getValues('selectedPages')}</p>
                      <p>• {getPrintTypeDisplayName(form.getValues('printType'))} with {form.getValues('bindingColorType') === 'color' ? 'Color' : 'Black & White'} printing</p>
                    </>
                  )}
                  {isCustomPrint && (
                    <>
                      <p>• Color pages: {form.getValues('colorPages') || 'None'}</p>
                      <p>• B&W pages: {form.getValues('bwPages') || 'None'}</p>
                      {isBindingType && <p>• {getPrintTypeDisplayName(form.getValues('printType'))}</p>}
                    </>
                  )}
                  <p>• {form.getValues('printSide') === 'double' ? 'Double' : 'Single'}-sided</p>
                  <p>• {form.getValues('copies')} {form.getValues('copies') === 1 ? 'copy' : 'copies'}</p>
                  {(form.getValues('printType') === 'softBinding' || form.getValues('printType') === 'spiralBinding') && (
                    <p>• Includes binding charges</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isCustomPrintType && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Custom Print Order</h3>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-blue-700">
                    Quote Required
                  </p>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  <p>• Our team will review your files and provide a custom quote</p>
                  <p>• We'll contact you within 10 minutes with pricing details</p>
                  <p>• Perfect for complex printing requirements</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-xerox-600 hover:bg-xerox-700"
              disabled={files.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Submitting Order...' : 'Submit Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

const getPrintTypeDisplayName = (type: string) => {
  switch (type) {
    case 'blackAndWhite': return 'Black & White';
    case 'color': return 'Color';
    case 'custom': return 'Custom (Mixed)';
    case 'softBinding': return 'Soft Binding';
    case 'spiralBinding': return 'Spiral Binding';
    case 'customPrint': return 'Custom Print';
    default: return type;
  }
};

export default OrderForm;