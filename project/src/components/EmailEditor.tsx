import React, { useState } from 'react';
import { Upload, AlignLeft, AlignCenter, AlignRight, Save, Eye, Type, Image as ImageIcon, ListEnd } from 'lucide-react';
import { EmailTemplate } from '../types/email';
import * as api from '../lib/api';

// Rest of the file remains exactly the same, just replace FooterIcon with ListEnd in the JSX
export default function EmailEditor() {
  const [template, setTemplate] = useState<EmailTemplate>({
    title: '',
    content: '',
    footer: '',
    styles: {
      titleColor: '#4F46E5',
      titleSize: '24px',
      contentColor: '#374151',
      contentSize: '16px',
      alignment: 'left'
    }
  });
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { imageUrl } = await api.uploadImage(file);
      setTemplate(prev => ({
        ...prev,
        imageUrl
      }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      await api.saveTemplate(template);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreviewTemplate = async () => {
    try {
      const blob = await api.renderTemplate(template);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to preview template:', error);
      alert('Failed to generate preview. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Editor Header */}
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <h2 className="text-2xl font-bold text-gray-800">Design Your Email Template</h2>
          <p className="text-gray-600 mt-1">Customize every aspect of your email template with our intuitive editor</p>
        </div>

        <div className="p-8">
          {/* Title Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Title Section</h3>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={template.title}
                onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                placeholder="Enter a compelling title..."
              />
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Color</label>
                  <input
                    type="color"
                    value={template.styles?.titleColor}
                    onChange={(e) => setTemplate({
                      ...template,
                      styles: { ...template.styles, titleColor: e.target.value }
                    })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Size</label>
                  <select
                    value={template.styles?.titleSize}
                    onChange={(e) => setTemplate({
                      ...template,
                      styles: { ...template.styles, titleSize: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  >
                    <option value="20px">Small</option>
                    <option value="24px">Medium</option>
                    <option value="32px">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlignLeft className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Content</h3>
            </div>
            <div className="space-y-4">
              <textarea
                value={template.content}
                onChange={(e) => setTemplate({ ...template, content: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                rows={6}
                placeholder="Write your email content here..."
              />
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={template.styles?.contentColor}
                    onChange={(e) => setTemplate({
                      ...template,
                      styles: { ...template.styles, contentColor: e.target.value }
                    })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Font Size</label>
                  <select
                    value={template.styles?.contentSize}
                    onChange={(e) => setTemplate({
                      ...template,
                      styles: { ...template.styles, contentSize: e.target.value }
                    })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
                  >
                    <option value="14px">Small</option>
                    <option value="16px">Medium</option>
                    <option value="18px">Large</option>
                  </select>
                </div>
                <div className="flex gap-2 bg-gray-50 p-2 rounded-lg">
                  <button
                    onClick={() => setTemplate({
                      ...template,
                      styles: { ...template.styles, alignment: 'left' }
                    })}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      template.styles?.alignment === 'left'
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <AlignLeft size={20} />
                  </button>
                  <button
                    onClick={() => setTemplate({
                      ...template,
                      styles: { ...template.styles, alignment: 'center' }
                    })}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      template.styles?.alignment === 'center'
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <AlignCenter size={20} />
                  </button>
                  <button
                    onClick={() => setTemplate({
                      ...template,
                      styles: { ...template.styles, alignment: 'right' }
                    })}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      template.styles?.alignment === 'right'
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >
                    <AlignRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Featured Image</h3>
            </div>
            <div className="flex items-center justify-center w-full">
              {template.imageUrl ? (
                <div className="relative w-full">
                  <img
                    src={template.imageUrl}
                    alt="Template"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    onClick={() => setTemplate({ ...template, imageUrl: undefined })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200 shadow-lg"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-100 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-indigo-50 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-4 text-indigo-500" />
                    <p className="mb-2 text-sm text-gray-600">
                      <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Footer Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ListEnd className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Footer</h3>
            </div>
            <textarea
              value={template.footer}
              onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200"
              rows={3}
              placeholder="Add your footer content..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={handlePreviewTemplate}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <Eye size={18} />
              Preview Template
            </button>
            <button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}