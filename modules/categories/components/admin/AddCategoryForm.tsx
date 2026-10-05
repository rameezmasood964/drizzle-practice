import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const CategoryForm = () => {
  return (
    <form className="space-y-4 py-2">
      {/* Category Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input 
          id="name"
          type="text" 
          placeholder="e.g. Hostels or Doctor" 
        />
      </div>

      {/* Slug Field */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input 
          id="slug"
          type="text" 
          placeholder="e.g. hostels" 
        />
      </div>

      {/* Parent Category Select */}
      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category</Label>
        <Select>
          <SelectTrigger id="parent" className="w-full cursor-pointer">
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">None (Root Category)</SelectItem>
            <SelectItem value="1">Hostels</SelectItem>
            <SelectItem value="4">Doctor</SelectItem>
            <SelectItem value="5">Lawyer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button type="submit" className="w-full cursor-pointer">
          Save Category
        </Button>
      </div>
    </form>
  )
}

export default CategoryForm