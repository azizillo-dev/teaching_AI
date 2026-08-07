"use client";

import { useState } from "react";
import { Plus, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { useBooks } from "@/features/library/hooks";
import { UploadBookDialog } from "@/features/library/components/LibraryDialogs";
import { Button } from "@/components/ui/button";

export default function LibraryPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: books, isLoading, isError } = useBooks();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kutubxona</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vazifalar uchun PDF kitoblarni yuklang va boshqaring.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Kitob yuklash
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>Kitoblarni yuklashda xatolik yuz berdi.</p>
        </div>
      ) : !books || books.length === 0 ? (
        <div className="border border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Kitoblar yo'q</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Hali hech qanday kitob yuklamagansiz. Vazifalar yaratishni osonlashtirish uchun birinchi kitobingizni yuklang.
          </p>
          <Button onClick={() => setIsUploadOpen(true)}>Kitob yuklash</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book.id} className="border rounded-lg p-4 bg-card flex flex-col hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold line-clamp-1 flex-1" title={book.title}>{book.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 ${
                  book.status === 'ready' ? 'bg-green-100 text-green-700' : 
                  book.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                }`}>
                  {book.status === 'ready' ? 'Tayyor' : book.status === 'processing' ? 'Kutilmoqda' : 'Xato'}
                </span>
              </div>
              
              {book.subject && <p className="text-xs text-muted-foreground mb-3">{book.subject}</p>}
              
              <div className="mt-auto pt-3 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> 
                  {book.total_pages ? `${book.total_pages} sahifa` : "Hisoblanmoqda..."}
                </span>
                <span>{new Date(book.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <UploadBookDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  );
}
