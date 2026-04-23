'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Camera, LogOut} from "lucide-react";
import NavItems from "@/components/NavItems";
import {signOut, updateUserImage} from "@/lib/actions/auth.actions";
import {useState} from "react";

const UserDropdown = ({ user, initialStocks }: {user: User, initialStocks: StockWithWatchlistStatus[]}) => {
    const router = useRouter();
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(user.image ?? '');
    const [saving, setSaving] = useState(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/sign-in");
        } catch (error) {
            console.error("Sign out failed:", error);
        }
    }

    const handleSaveImage = async () => {
        setSaving(true);
        const result = await updateUserImage(imageUrl);
        setSaving(false);
        if (result.success) {
            setImageDialogOpen(false);
            router.refresh();
        }
    }

    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 text-gray-400 hover:text-yellow-500">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image ?? undefined} />
                        <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                            {user.name[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className='text-base font-medium text-gray-400'>
                            {user.name}
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-gray-400">
                <DropdownMenuLabel>
                    <div className="flex relative items-center gap-3 py-2">
                        <div className="relative cursor-pointer group" onClick={() => setImageDialogOpen(true)}>
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.image ?? undefined} />
                                <AvatarFallback className="bg-yellow-500 text-yellow-900 text-sm font-bold">
                                    {user.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-4 w-4 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className='text-base font-medium text-gray-400'>
                                {user.name}
                            </span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600"/>
                <DropdownMenuItem onClick={handleSignOut} className="text-gray-100 text-md font-medium focus:bg-transparent focus:text-yellow-500 transition-colors cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2 hidden sm:block" />
                    Logout
                </DropdownMenuItem>
                <DropdownMenuSeparator className="hidden sm:block bg-gray-600"/>
                <nav className="sm:hidden">
                    <NavItems initialStocks={initialStocks} />
                </nav>
            </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-gray-100">
                        {user.image ? 'Change Profile Picture' : 'Add Profile Picture'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/your-photo.jpg"
                        className="form-input"
                    />
                    {imageUrl && (
                        <Avatar className="h-16 w-16 mx-auto">
                            <AvatarImage src={imageUrl} />
                            <AvatarFallback className="bg-yellow-500 text-yellow-900 font-bold">
                                {user.name[0]}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setImageDialogOpen(false)} className="text-gray-400">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveImage} disabled={saving} className="yellow-btn">
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
}
export default UserDropdown
