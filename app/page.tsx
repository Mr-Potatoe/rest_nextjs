"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// Define types for form data and errors
interface UserFormData {
  name: string;
  email: string;
  age: number | ""; // Allow empty string for controlled input
}

interface ValidationErrors {
  name: string;
  email: string;
  age: string;
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // ✅ Track open state
  const [formData, setFormData] = useState<UserFormData>({ name: "", email: "", age: "" });
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null); // Track user for deletion
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // Control dialog open state
  const [errors, setErrors] = useState<ValidationErrors>({ name: "", email: "", age: "" });
  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state
  const [isDeleting, setIsDeleting] = useState(false); // New loading state
  const toastId = "request-count-toast"; // Unique toast ID


  const updateRequestCount = async () => {
    try {
      const res = await fetch("/api/request-count");
      const data = await res.json();
  
      // 🔥 Use `toast.loading()` to update without flickering
      toast.loading(`Requests used: ${data.count}/50`, {
        id: toastId,
        duration: Infinity, // Persist toast
      });
    } catch (error) {
      console.error("Failed to fetch request count:", error);
    }
  };
  
  const fetchUsers = async (showToast = false) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
  
      if (showToast) toast.success(data.message);
  
      setUsers(data.users);
  
      // 🔄 Update request count in real-time
      updateRequestCount();
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    // ✅ Use `toast.loading()` to persist without flickering
    toast.loading(`Requests used: 0/50`, { id: toastId, duration: Infinity });
    updateRequestCount(); // Fetch initial request count
  
    const isFirstLoad = sessionStorage.getItem("firstLoad");
  
    if (!isFirstLoad) {
      fetchUsers(true);
      sessionStorage.setItem("firstLoad", "true");
    } else {
      fetchUsers(false);
    }
  }, []);
  

// Validate input on change
const validateInput = (name: keyof UserFormData, value: string | number) => {
  let error = "";

  if (name === "name") {
    const nameValue = value?.toString().trim() || "";
    if (!nameValue) error = "Name is required.";
    else if (nameValue.length < 3) error = "Name must be at least 3 characters.";
  }

  if (name === "email") {
    const emailValue = value?.toString().trim() || "";
    if (!emailValue) error = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(emailValue)) error = "Invalid email format.";
  }

  if (name === "age") {
    const ageValue = Number(value) || 0;
    if (!ageValue) error = "Age is required.";
    else if (ageValue < 18) error = "Age must be at least 18.";
  }

  setErrors((prev) => ({ ...prev, [name]: error }));
};


// Check if form is valid
const isFormValid = Object.values(errors).every((error) => !error) &&
  Object.values(formData).every((value) => value.toString().trim() !== "");

// Handle input change with validation
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  const formattedValue = name === "age" ? Number(value) || "" : value; // Ensure age is a number
  setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  validateInput(name as keyof UserFormData, formattedValue);
};
  // Add or Edit User
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.age) {
      toast.error("All fields are required!");
      return;
    }
  
    setIsSubmitting(true); // Start loading
  
    const method = editUser ? "PUT" : "POST";
    const res = await fetch(`/api/users`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editUser ? { id: editUser.id, ...formData } : formData),
    });
  
    const data = await res.json(); // Parse API response
  
    if (res.status === 429) {
      toast.error("Daily request limit reached. Try again tomorrow.");
      setIsSubmitting(false); // Stop loading
      return;
    }
  
    if (res.ok) {
      toast.success(data.message || (editUser ? "User updated!" : "User added!"));
  
      if (!editUser && !data.user) {
        fetchUsers();
      } else {
        setUsers((prevUsers) =>
          editUser
            ? prevUsers.map((user) =>
                user.id === editUser.id ? { ...user, ...formData } : user
              )
            : [...prevUsers, data.user]
        );
      }
  
      setEditUser(null);
      setFormData({ name: "", email: "", age: "" });
      setIsDialogOpen(false);
    } else {
      toast.error(data.error || "Something went wrong!");
    }
  
    setIsSubmitting(false); // Stop loading
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
  
    setIsDeleting(true); // Start loading
  
    try {
      const res = await fetch(`/api/users?id=${deleteUserId}`, { method: "DELETE" });
  
      if (res.status === 429) {
        toast.error("Daily request limit reached. Try again tomorrow.");
        setIsDeleting(false);
        return;
      }
  
      if (!res.ok) throw new Error("Failed to delete user");
  
      const data = await res.json();
      toast.success(data.message);
  
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteUserId));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user. Please try again.");
    }
  
    setIsDeleting(false); // Stop loading
  };
  
  // Open delete confirmation dialog
  const confirmDelete = (id: number) => {
    setDeleteUserId(id);
    setIsDeleteDialogOpen(true);
  };



  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {/* Add User Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setEditUser(null); // Clear edit state
              setFormData({ name: "", email: "", age: "" }); // Reset form
            }}
          >
            Add User
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
          </DialogHeader>

          {/* Name Input */}
          <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

          {/* Email Input */}
          <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          {/* Age Input */}
          <Input name="age" placeholder="Age" type="number" value={formData.age === "" ? "" : Number(formData.age)}  onChange={handleChange} />
          {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

          {/* Add User Button (Disabled if invalid) */}
          <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Submitting...
              </div>
            ) : (
              "Add User"
            )}
          </Button>

        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            // Dynamically show 5 skeleton rows
            [...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16 rounded-md" /></TableCell>
              </TableRow>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.age}</TableCell>
                <TableCell className="space-x-2">
                  {/* Edit Dialog */}
                  <Dialog onOpenChange={(open) => !open && setEditUser(null)} open={editUser?.id === user.id}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditUser(user);
                          setFormData({
                            name: user.name || "", 
                            email: user.email || "", 
                            age: user.age ?? "", // Ensure age is valid or empty
                          });                        }}
                      >
                        Edit
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>

                      {/* Edit Form Inputs with Validation Messages */}
                      <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

                      <Input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

                      <Input name="age" placeholder="Age" type="number" value={formData.age === "" ? "" : Number(formData.age)}  onChange={handleChange} />
                      {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}

                      {/* Disable button if form is invalid */}
                      <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting}>
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                            Updating...
                          </div>
                        ) : (
                          "Update User"
                        )}
                      </Button>

                    </DialogContent>
                  </Dialog>


                  {/* Delete Button */}
                  <Button size="sm" variant="destructive" onClick={() => confirmDelete(user.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No users found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <p>Are you sure you want to delete this user?</p>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Deleting...
              </div>
            ) : (
              "Delete"
            )}
          </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
