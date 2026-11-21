import { useState, useCallback } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'comidaria-images';

export const ImageUploader = ({ value, onChange, accept = 'image/*', maxSizeMB = 5 }) => {
  const [preview, setPreview] = useState(value || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione apenas arquivos de imagem');
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Imagem muito grande (máx ${maxSizeMB}MB)`);
      return;
    }

    setError(null);
    setUploading(true);
    const url = URL.createObjectURL(file);
    setPreview(url);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      onChange(publicUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao fazer upload da imagem');
      setPreview(value || null);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [value, onChange, maxSizeMB]);

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-700 mb-1">Imagem</label>

      {preview ? (
        <div className="relative group">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-xs font-medium">Enviando...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={(e) => e.target.value && e.target.click()}
          className="flex flex-col items-center justify-center gap-2 w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-xs text-gray-500">Escolher imagem</span>
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
        </button>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};