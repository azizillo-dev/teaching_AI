"use client";

import { useState } from "react";
import { Plus, BookOpen, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useBooks, useDeleteBook } from "@/features/library/hooks";
import { UploadBookDialog } from "@/features/library/components/LibraryDialogs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { getMediaUrl } from "@/utils/media";

export default function LibraryPage() {
  const { user } = useAuth();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: books, isLoading, isError } = useBooks();
  const deleteMutation = useDeleteBook();

  const isTeacher = user?.role === "teacher";

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Siz rostdan ham "${title}" kitobini o'chirmoqchimisiz?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kutubxona</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Vazifalar uchun PDF va boshqa kitoblarni ko'ring.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => setIsUploadOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Kitob yuklash
          </Button>
        )}
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
            Hozircha kutubxonada hech qanday kitob mavjud emas.
          </p>
          {isTeacher && (
            <Button onClick={() => setIsUploadOpen(true)}>Kitob yuklash</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <div key={book.id} className="border rounded-lg bg-card flex flex-col hover:shadow-md transition-shadow group relative overflow-hidden">
              <a 
                href={getMediaUrl(book.file)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="absolute inset-0 z-0"
                title="Faylni ochish"
              >
                <span className="sr-only">Kitobni ochish</span>
              </a>
              
              <div className="p-4 flex flex-col h-full relative z-10 pointer-events-none">
                <div className="flex justify-between items-start mb-2 pointer-events-auto">
                  <h3 className="font-semibold line-clamp-1 flex-1 pr-6" title={book.title}>{book.title}</h3>
                  
                  {isTeacher && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(book.id, book.title); }}
                      className="absolute top-3 right-3 p-1.5 bg-destructive/10 text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                      title="Kitobni o'chirish"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending && deleteMutation.variables === book.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                
                <div className="flex items-center mt-1 mb-3 pointer-events-auto">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    book.status === 'ready' ? 'bg-green-100 text-green-700' : 
                    book.status === 'processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {book.status === 'ready' ? 'Tayyor' : book.status === 'processing' ? 'Kutilmoqda' : 'Xato'}
                  </span>
                </div>
                
                {book.subject && <p className="text-xs text-muted-foreground mb-3">{book.subject}</p>}
                
                <div className="mt-auto pt-3 border-t flex justify-between items-center text-xs text-muted-foreground pointer-events-auto">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> 
                    {book.total_pages ? `${book.total_pages} sahifa` : ""}
                  </span>
                  <span>{new Date(book.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isTeacher && (
        <UploadBookDialog 
          isOpen={isUploadOpen} 
          onClose={() => setIsUploadOpen(false)} 
        />
      )}
    </div>
  );
}
