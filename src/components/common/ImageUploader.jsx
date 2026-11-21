import { useState, useCallback } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'comidaria-images';

export const ImageUploader = ({ value, onChange, accept = 'image/*', maxSizeMB = 5 }) => {
  const [preview, setPreview] = useState(value || null);
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUrlChange = useCallback((e) => {
    setUrlInput(e.target.value);
    setError(null);
  }, []);

  const handleApplyUrl = useCallback(() => {
    if (!urlInput.trim()) {
      setPreview(null);
      onChange(null);
      setError(null);
      return;
    }
    try {
      new URL(urlInput);
      setPreview(urlInput.trim());
      onChange(urlInput.trim());
      setError(null);
    } catch {
      setError('URL inválida');
    }
  }, [urlInput, onChange]);

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
      setUrlInput(publicUrl);
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
    setUrlInput('');
    onChange(null);
    setError(null);
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Cole a URL da imagem..."
              value={urlInput}
              onChange={handleUrlChange}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            />
            <button
              onClick={handleApplyUrl}
              disabled={!urlInput.trim()}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Aplicar URL
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="image-file-input"
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
            <label
              htmlFor="image-file-input"
              className="flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-600 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Enviar arquivo
            </label>
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};
