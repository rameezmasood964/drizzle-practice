"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CategoryForm from "./AddCategoryForm"

const CategoryTable = () => {
  const [open, setOpen] = useState(false)

  const CategoriesData = [
    { 
      id: "1", 
      name: "Hostels", 
      slug: "hostels", 
      parent_id: null, 
      parent_name: "Root", 
      sub_count: 2 
    },
    { 
      id: "2", 
      name: "Girls Hostel", 
      slug: "girls-hostel", 
      parent_id: "1", 
      parent_name: "Hostels", 
      sub_count: 0 
    },
    { 
      id: "3", 
      name: "Boys Hostel", 
      slug: "boys-hostel", 
      parent_id: "1", 
      parent_name: "Hostels", 
      sub_count: 0 
    },
    { 
      id: "4", 
      name: "Doctor", 
      slug: "doctor", 
      parent_id: null, 
      parent_name: "Root", 
      sub_count: 0 
    },

    { 
      id: "5", 
      name: "Eye Specialist", 
      slug: "eye specialist", 
      parent_id: 4, 
      parent_name: "Doctor", 
      sub_count: 0 
    },
    { 
      id: "6", 
      name: "Heart Specialist", 
      slug: "heart specialist", 
      parent_id: 4, 
      parent_name: "Doctor", 
      sub_count: 0 
    },
     { 
      id: "7", 
      name: " public Heart Specialist", 
      slug: " public heart specialist", 
      parent_id: 6, 
      parent_name: "Heart Specialist", 
      sub_count: 0 
    },
    
    { 
      id: "8", 
      name: "Lawyer", 
      slug: "lawyer", 
      parent_id: null, 
      parent_name: "Root", 
      sub_count: 0 
    },
  ]

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
      {/* Heading and Add Category Dialog */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Categories</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              Add Category +
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Shadcn Table start */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="p-4 font-medium">Name</TableHead>
              <TableHead className="p-4 font-medium">Slug</TableHead>
              <TableHead className="p-4 font-medium">Parent Category</TableHead>
              <TableHead className="p-4 font-medium">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {CategoriesData.length > 0 && CategoriesData.map((cat) => {
              const isSubCategory = cat.parent_id !== null;
              return (
                <TableRow key={cat.id} className="hover:bg-muted/50 transition-colors">
                  {/* Name with Tree Indentation */}


                  <TableCell className="p-4">
                    <div className={`flex items-center gap-2 ${isSubCategory ? "pl-6" : ""}`}>
                      {isSubCategory && (
                        <span className="text-muted-foreground font-mono">└──</span>
                      )}
                      <span className={isSubCategory ? "font-normal text-muted-foreground" : "font-semibold text-foreground"}>
                        {cat.name}
                      </span>
                    </div>
                  </TableCell>



                  <TableCell className="p-4 text-muted-foreground">{cat.slug}</TableCell>

                  {/* Parent Category & Sub-count Badge */}
                  <TableCell className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          cat.parent_name === "Root"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {cat.parent_name}
                      </span>
                      
                      {cat.sub_count > 0 && (
                        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-md text-xs">
                          {cat.sub_count} subs
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="p-4 space-x-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground cursor-pointer font-medium">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80 cursor-pointer font-medium">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CategoryTable