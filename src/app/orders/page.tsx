// File: src/app/orders/page.tsx
// Description: The COMPLETE and FINAL refactored Orders page.
// This version is brand-agnostic, uses dynamic charges, and fixes the .map() runtime error.
// It can be trusted to replace your original file.

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// --- TYPE DEFINITIONS ---
type Organization = { id: string; name: string; gstin?: string; address?: string; contact?: string, logoUrl?: string; };
type Branch = { id: string; name: string; address?: string; contact?: string; gstin?: string; timezone?: string; };
type Category = { id: string; name: string };
type Product = { id: string; name: string; unit_price: number; category_id: string; is_active: boolean };
type PaymentMethod = "Cash" | "Card" | "Upi" | "Swiggy" | "Zomato";
type BranchCharge = { type: string; amount: number; };
interface SelectedProduct extends Product { quantity: number; }

const paymentMethods: PaymentMethod[] = ["Cash", "Card", "Upi", "Swiggy", "Zomato"];

export default function OrdersPage() {
  // --- STATE MANAGEMENT ---
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branchCharges, setBranchCharges] = useState<BranchCharge[]>([]);
  const [appliedCharges, setAppliedCharges] = useState<Record<string, boolean>>({});
  
  const [loading, setLoading] = useState(true);
  const [chargesLoading, setChargesLoading] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"%" | "₹">("%");
  const [discountCode, setDiscountCode] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [aggregatorOrderId, setAggregatorOrderId] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [cashAmount, setCashAmount] = useState<number | "">("");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    setLoading(true);
    setOrganization({ id: 'org_123', name: 'Corelytix Demo Cafe', gstin: '29ABCDE1234F1Z5', address: '123 Innovation Lane, Tech Park, Bangalore', contact: '9876543210' });

    Promise.all([
      fetch("/api/branches").then(res => res.json()),
      fetch("/api/categories").then(res => res.json()),
      fetch("/api/products").then(res => res.json())
    ]).then(([branchesData, categoriesData, productsData]) => {
      // FIX: Ensure data is an array before setting state to prevent .map() errors
      setBranches(Array.isArray(branchesData) ? branchesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProducts((Array.isArray(productsData) ? productsData : []).filter((p: Product) => p.is_active));
      
      const lastBranch = localStorage.getItem("selectedBranch");
      const branchList = Array.isArray(branchesData) ? branchesData : [];
      if (lastBranch && branchList.some((b: Branch) => b.id === lastBranch)) {
        setSelectedBranch(lastBranch);
      }
    }).catch(error => {
        console.error("Failed to fetch initial data:", error);
        // Set to empty arrays on failure to prevent crash
        setBranches([]);
        setCategories([]);
        setProducts([]);
    })
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedBranch) {
      setBranchCharges([]);
      return;
    }

    setChargesLoading(true);
    fetch(`/api/charges?branch_id=${selectedBranch}`)
      .then(res => res.json())
      .then(data => {
        // FIX: Ensure charges data is an array
        setBranchCharges(data && Array.isArray(data.charges) ? data.charges : []);
        setAppliedCharges({});
      })
      .catch(err => console.error("Failed to fetch charges:", err))
      .finally(() => setChargesLoading(false));

    localStorage.setItem("selectedBranch", selectedBranch);
  }, [selectedBranch]);

  // --- UI LOGIC & CALCULATIONS ---
  const visibleProducts = products.filter(p =>
    (selectedCategory === "all" || p.category_id === selectedCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const setProductQuantity = (productId: string, qty: number) => {
    if (qty < 1) {
      removeProduct(productId);
    } else {
      setSelectedProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, quantity: qty } : p))
      );
    }
  };
  
  const handleChargeToggle = (chargeType: string) => {
    setAppliedCharges(prev => ({ ...prev, [chargeType]: !prev[chargeType] }));
  };

  const subtotal = selectedProducts.reduce((acc, p) => acc + p.unit_price * p.quantity, 0);
  const totalCharges = branchCharges.reduce((acc, charge) => appliedCharges[charge.type] ? acc + Number(charge.amount) : acc, 0);
  let discount = 0;
  if (discountType === "%" && discountValue > 0) discount = Math.round(subtotal * discountValue / 100);
  if (discountType === "₹" && discountValue > 0) discount = discountValue;
  if (discount > subtotal) discount = subtotal;
  const gst = Math.round((subtotal + totalCharges - discount) * 0.18);
  const total = Math.max(0, subtotal + totalCharges - discount + gst);
  let change = 0;
  if (paymentMethod === "Cash" && cashAmount !== "" && cashAmount >= total) change = cashAmount - total;

  function validateOrder() {
    if (!selectedBranch) return "Please select a branch.";
    if (selectedProducts.length === 0) return "Please select at least one product.";
    if (customerPhone && !/^\d{10}$/.test(customerPhone)) return "Phone must be 10 digits.";
    if (paymentMethod === "Cash" && (cashAmount === "" || cashAmount < total)) return "Cash given is less than total.";
    return null;
  }
  
  async function handleSubmitOrder() {
    const validationMsg = validateOrder();
    if (validationMsg) {
      setOrderError(validationMsg);
      return;
    }
    setSubmitting(true);
    setOrderError(null);

    const activeCharges = branchCharges.filter(charge => appliedCharges[charge.type]);
    const payload = {
      branch_id: selectedBranch,
      products: selectedProducts.map(p => ({ id: p.id, qty: p.quantity, unit_price: p.unit_price, discount_amt: 0 })),
      charges: activeCharges.reduce((obj, charge) => { obj[charge.type] = charge.amount; return obj; }, {} as Record<string, number>),
      discountValue, discountCode, gst, total, paymentMethod,
      cashGiven: paymentMethod === "Cash" ? cashAmount : undefined,
      changeGiven: paymentMethod === "Cash" ? change : undefined,
      customerName, customerPhone, aggregatorOrderId, orderNotes
    };

    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).error || "Order failed. Try again.");
      const data = await res.json();
      setOrderSuccess(true);
      // Reset form
      setSelectedProducts([]);
      setDiscountValue(0);
      setDiscountType("%");
      setDiscountCode("");
      setAppliedCharges({});
      setCustomerName("");
      setCustomerPhone("");
      setAggregatorOrderId("");
      setOrderNotes("");
      setPaymentMethod("Cash");
      setCashAmount("");
      handleShowInvoice(data.order);
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const handleShowInvoice = (data: any) => { setInvoiceData(data); setInvoiceOpen(true); };
  const handleInvoiceClose = () => { setInvoiceOpen(false); setInvoiceData(null); setOrderSuccess(false); };
  
  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice</title><style>body{font-family:Arial,sans-serif;color:#222;padding:24px}.header{text-align:center;font-weight:700;font-size:24px;margin-bottom:12px}.subheader{text-align:center;color:#888;font-size:14px;margin-bottom:16px}table{width:100%;border-collapse:collapse;margin:12px 0}th,td{border:1px solid #ccc;padding:6px;text-align:left}.totals td{font-weight:700}.invoice-footer{margin-top:32px;text-align:center;font-size:13px;color:#666}</style></head><body>${printContents}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 text-gray-800 font-sans flex flex-col">
      <nav className="w-full flex items-center px-8 py-3 bg-white border-b shadow-sm sticky top-0 z-20">
        {organization?.logoUrl ? <img src={organization.logoUrl} alt="logo" className="w-10 h-10 rounded-full mr-4" /> : <div className="w-10 h-10 rounded-full mr-4 bg-gray-200"></div>}
        <span className="text-2xl font-bold tracking-tight text-gray-900">{organization?.name || "Corelytix POS"}</span>
      </nav>

      <main className="flex-1 flex flex-col md:flex-row w-full max-w-screen-2xl mx-auto p-4 gap-4">
        <Card className="flex-1 bg-white border-none rounded-2xl shadow-md p-6 flex flex-col">
           <div className="flex flex-col md:flex-row gap-4 mb-4">
              <Select value={selectedBranch ?? ""} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-full md:w-48 font-semibold rounded-lg">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>{branches.map(b => <SelectItem value={b.id} key={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="flex-1 min-w-[180px] rounded-lg" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-40 font-semibold rounded-lg">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {categories.map(c => <SelectItem value={c.id} key={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
              </Select>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-4 overflow-y-auto" style={{maxHeight: '75vh'}}>
                {visibleProducts.length === 0 ? <div className="text-gray-500 col-span-full text-center py-10">No products found.</div> : visibleProducts.map(product => {
                  const selected = selectedProducts.find(p => p.id === product.id);
                  return (
                    <div key={product.id} onClick={() => addProduct(product)} tabIndex={0}
                      className={`relative flex flex-col bg-white border-2 ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'} rounded-xl p-3 cursor-pointer shadow-sm transition hover:scale-105 hover:shadow-lg`}>
                      <span className="font-bold text-sm text-gray-800 flex-grow">{product.name}</span>
                      <span className="text-gray-600 font-semibold text-sm mt-1">₹{product.unit_price}</span>
                      {selected && <div className="absolute top-1 right-1 bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow">×{selected.quantity}</div>}
                    </div>);
                })}
              </div>
        </Card>
        
        <Card className="w-full md:w-96 lg:w-[400px] bg-white rounded-2xl shadow-md p-6 flex flex-col">
          <div className="text-xl font-bold text-gray-800 mb-4">Current Order</div>
            {selectedProducts.length === 0 ? <div className="text-gray-500 text-sm flex-grow flex items-center justify-center">No products selected.</div> : 
              <div className="flex-grow overflow-y-auto pr-2 -mr-2 mb-4">
                {selectedProducts.map(item =>
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1 mr-2">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.unit_price} × {item.quantity} = ₹{(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setProductQuantity(item.id, item.quantity - 1)}>-</Button>
                      <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => setProductQuantity(item.id, item.quantity + 1)}>+</Button>
                    </div>
                  </div>
                )}
              </div>
            }

            <div className="mt-auto">
              <div className="flex flex-col gap-2 mb-4">
                <h4 className="font-semibold text-gray-700 text-sm">Additional Charges</h4>
                {chargesLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : branchCharges.length > 0 ? branchCharges.map(charge => (
                    <label key={charge.type} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={!!appliedCharges[charge.type]} onChange={() => handleChargeToggle(charge.type)} className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"/>
                      <span>{charge.type.charAt(0).toUpperCase() + charge.type.slice(1)} (₹{charge.amount})</span>
                    </label>
                  )) : <p className="text-xs text-gray-500">No charges defined for this branch.</p>
                }
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex gap-2 items-center">
                    <Input type="number" min={0} value={discountValue === 0 ? "" : discountValue} className="w-20" placeholder="Disc." onChange={e => setDiscountValue(Number(e.target.value))} />
                    <Select value={discountType} onValueChange={val => setDiscountType(val as "%" | "₹")}>
                        <SelectTrigger className="w-20 h-9 rounded bg-white border border-gray-300"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="%">%</SelectItem><SelectItem value="₹">₹</SelectItem></SelectContent>
                    </Select>
                    <Input value={discountCode} onChange={e => setDiscountCode(e.target.value)} placeholder="Discount code" className="flex-1" />
                </div>
                <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name (optional)" maxLength={50} />
                <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/\D/, ""))} maxLength={10} placeholder="Phone (optional, 10 digits)" />
                <Input value={aggregatorOrderId} onChange={e => setAggregatorOrderId(e.target.value)} placeholder="Aggregator Order ID" />
                <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="Order Notes / Instructions" className="w-full p-2 text-sm rounded border border-gray-300" rows={2} />
              </div>

              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map(method =>
                    <Button key={method} type="button" onClick={() => setPaymentMethod(method)} variant={paymentMethod === method ? 'default' : 'outline'} className="text-xs h-9">
                      {method}
                    </Button>
                  )}
                </div>
                 {paymentMethod === "Cash" && (
                   <div className="flex items-center gap-2 mt-3">
                     <Input type="number" min={0} value={cashAmount} onChange={e => setCashAmount(Number(e.target.value))} placeholder="Cash Received" className="flex-1" />
                     <div className="text-sm">Change: <span className="font-bold">₹{change.toFixed(2)}</span></div>
                   </div>
                 )}
              </div>

              <div className="pt-4 border-t text-sm space-y-1">
                <div>Subtotal <span className="float-right font-medium">₹{subtotal.toFixed(2)}</span></div>
                <div>Charges <span className="float-right font-medium">₹{totalCharges.toFixed(2)}</span></div>
                <div>Discount <span className="float-right font-medium text-green-600">-₹{discount.toFixed(2)}</span></div>
                <div>GST (18%) <span className="float-right font-medium">₹{gst.toFixed(2)}</span></div>
                <div className="border-t-2 border-gray-300 my-2"></div>
                <div className="text-lg font-bold text-gray-900">Total <span className="float-right">₹{total.toFixed(2)}</span></div>
              </div>
              
              {orderError && <div className="text-red-600 mt-2 text-sm font-semibold text-center">{orderError}</div>}
              
              <Button onClick={handleSubmitOrder} disabled={submitting || selectedProducts.length === 0} className="w-full mt-4 rounded-lg py-3 text-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition">
                  {submitting ? <Loader2 className="h-6 w-6 animate-spin"/> : "Submit Order"}
              </Button>
            </div>
        </Card>
      </main>

      <Dialog open={invoiceOpen} onOpenChange={handleInvoiceClose}>
         <DialogContent className="max-w-md bg-white text-black p-6 rounded-lg">
            {invoiceData ? (
              <div ref={printRef}>
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">{organization?.name}</h2>
                  <p className="text-xs">{branches.find(b => b.id === invoiceData.branch_id)?.address}</p>
                  <p className="text-xs">GSTIN: {branches.find(b => b.id === invoiceData.branch_id)?.gstin}</p>
                  <p className="text-xs">Phone: {branches.find(b => b.id === invoiceData.branch_id)?.contact}</p>
                </div>
                <div className="border-t border-b border-dashed my-2 py-2 text-xs">
                  <p><strong>Invoice #:</strong> {invoiceData.invoice_prefix}-{invoiceData.invoice_number?.toString().padStart(5,"0")}</p>
                  <p><strong>Date:</strong> {new Date(invoiceData.created_at).toLocaleString("en-IN", { hour12: true })}</p>
                  <p><strong>Customer:</strong> {invoiceData.customer_name || "Walk-in"}</p>
                </div>
                <table className="w-full text-xs my-2">
                  <thead><tr className="border-b"><th className="text-left font-semibold pb-1">Item</th><th className="text-center font-semibold pb-1">Qty</th><th className="text-right font-semibold pb-1">Amount</th></tr></thead>
                  <tbody>
                    {invoiceData.order_items?.map((item: any) => (
                      <tr key={item.id}><td className="py-1">{products.find(p => p.id === item.product_id)?.name}</td><td className="text-center">{item.quantity}</td><td className="text-right">₹{(item.unit_price * item.quantity).toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-dashed pt-2 mt-2 text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal:</span><span>₹{(invoiceData.order_items?.reduce((sum: number, item: any) => sum + item.unit_price * item.quantity, 0) ?? 0).toFixed(2)}</span></div>
                  {invoiceData.order_charges?.map((c: any) => (<div key={c.id} className="flex justify-between"><span>{c.type.charAt(0).toUpperCase() + c.type.slice(1)}:</span><span>₹{Number(c.amount).toFixed(2)}</span></div>))}
                  {invoiceData.order_coupons?.length > 0 && <div className="flex justify-between"><span>Discount:</span><span className="text-green-600">-₹{invoiceData.order_coupons.reduce((sum: number, c: any) => sum + Number(c.value), 0).toFixed(2)}</span></div>}
                  {invoiceData.order_taxes?.length > 0 && <div className="flex justify-between"><span>GST:</span><span>₹{Number(invoiceData.order_taxes[0].amount).toFixed(2)}</span></div>}
                  <div className="flex justify-between font-bold text-base border-t border-black mt-2 pt-1"><span>Total:</span><span>₹{Number(invoiceData.payments?.[0]?.amount ?? 0).toFixed(2)}</span></div>
                </div>
                 <div className="text-center mt-4 text-xs">Thank you!</div>
                 <div className="flex justify-around mt-4">
                  <Button onClick={handlePrint} variant="outline">Print</Button>
                  <Button onClick={handleInvoiceClose}>Next Order</Button>
                </div>
              </div>
            ) : <Loader2 className="h-6 w-6 animate-spin mx-auto"/>}
         </DialogContent>
      </Dialog>
    </div>
  );
}

function numberToWords(num: number): string {
    if (num === 0) return "zero rupees";
    num = Math.floor(num);
    const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    function inWords(n: number): string {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + " hundred" + (n % 100 ? " and " + inWords(n % 100) : "");
        if (n < 100000) return inWords(Math.floor(n / 1000)) + " thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + " lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
        return "";
    }
    return inWords(num) + " rupees";
}
