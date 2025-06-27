// File: src/app/admin/branches/page.tsx
// Description: UI for viewing and adding new business branches.

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, PlusCircle } from 'lucide-react';

// Define the type for a branch, mirroring our Prisma schema
type Branch = {
  id: string;
  name: string;
  address: string;
  contact: string;
  gstin: string;
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the "Add New Branch" form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newBranch, setNewBranch] = useState({
    name: '',
    address: '',
    contact: '',
    gstin: ''
  });

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const res = await fetch('/api/branches');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch branches');
      }
      const data = await res.json();
      setBranches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBranch(prev => ({ ...prev, [name]: value }));
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBranch)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create branch');
      }
      // Reset form and refetch branches to update the list
      setNewBranch({ name: '', address: '', contact: '', gstin: '' });
      await fetchBranches(); // Refetch to show the new branch
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Branch</CardTitle>
            <CardDescription>Fill out the details for your new business location.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddBranch} className="grid gap-4 md:grid-cols-2 lg:gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input id="name" name="name" value={newBranch.name} onChange={handleInputChange} placeholder="e.g., Kompally" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" name="gstin" value={newBranch.gstin} onChange={handleInputChange} placeholder="Your branch's GST number" required />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={newBranch.address} onChange={handleInputChange} placeholder="Full address of the branch" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contact">Contact Number</Label>
                <Input id="contact" name="contact" value={newBranch.contact} onChange={handleInputChange} placeholder="Branch phone number" required />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                  Add Branch
                </Button>
              </div>
            </form>
            {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Branches</CardTitle>
            <CardDescription>A list of all business locations in your organization.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
                 <p className="text-sm text-red-600 text-center py-8">{error}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>GSTIN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No branches found. Add one above to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>{branch.address}</TableCell>
                        <TableCell>{branch.contact}</TableCell>
                        <TableCell>{branch.gstin}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
