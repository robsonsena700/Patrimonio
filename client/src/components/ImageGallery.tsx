
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, Download } from "lucide-react";

interface ImageGalleryProps {
  photos?: string | any[];
  title?: string;
  className?: string;
}

export default function ImageGallery({ photos, title = "Imagens", className = "" }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Parse photos if it's a string
  let imageList: any[] = [];
  if (photos) {
    if (typeof photos === 'string') {
      try {
        imageList = JSON.parse(photos);
      } catch (error) {
        console.error('Error parsing photos:', error);
        imageList = [];
      }
    } else if (Array.isArray(photos)) {
      imageList = photos;
    }
  }

  if (!imageList || imageList.length === 0) {
    return null;
  }

  const handleImageClick = (image: any) => {
    setSelectedImage(image.filename);
    setZoomLevel(1);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = (image: any) => {
    const link = document.createElement('a');
    link.href = `/api/uploads/${image.filename}`;
    link.download = image.originalName || image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={className}>
      <div className="mb-2">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{imageList.length} foto(s)</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {imageList.map((image: any, index: number) => (
          <div key={index} className="relative group cursor-pointer">
            <img
              src={`/api/uploads/${image.filename}`}
              alt={image.originalName || `Imagem ${index + 1}`}
              className="w-full h-20 object-cover rounded-lg border border-border hover:border-primary transition-colors"
              onClick={() => handleImageClick(image)}
              onError={(e) => {
                console.error('Error loading image:', image.filename);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
              <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full size image */}
      <Dialog open={!!selectedImage} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Visualização da Imagem</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const image = imageList.find(img => img.filename === selectedImage);
                    if (image) handleDownload(image);
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
            {selectedImage && (
              <img
                src={`/api/uploads/${selectedImage}`}
                alt="Imagem ampliada"
                className="max-w-full h-auto rounded-lg"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease-in-out'
                }}
                onError={(e) => {
                  console.error('Error loading full size image:', selectedImage);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
