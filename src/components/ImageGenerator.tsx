import React, { useState } from 'react';
import { OpenAI } from 'openai';
import { ImageIcon, Loader2 } from 'lucide-react';

interface ImageGeneratorProps {
  openai: OpenAI;
}

function ImageGenerator({ openai }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      setImageUrl(response.data[0].url || '');
    } catch (err) {
      setError('Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <form onSubmit={generateImage} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Enter your prompt
          </label>
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A futuristic city with flying cars"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2" size={20} />
              Generate Image
            </>
          )}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {imageUrl && (
        <div className="mt-6">
          <img src={imageUrl} alt="Generated image" className="w-full rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
}

export default ImageGenerator;