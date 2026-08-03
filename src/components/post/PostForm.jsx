import { useForm } from 'react-hook-form';
import { useState } from 'react';
import clsx from 'clsx';
import Input from '../ui/Input';
import Button from '../ui/Button';
import AIPostAssistant from '../ai/AIPostAssistant';
import { fileToBase64 } from '../../utils/helpers';

const MAX_CHARS = 500;

/**
 * Shared form for both Create Post and Edit Post.
 * Calls onSubmit(data, { asDraft }) with { description, image, isPublic }.
 */
export default function PostForm({ defaultValues, onSubmit, submitting, resetOnDraftSave = false }) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: defaultValues?.description || '',
      isPublic: defaultValues?.isPublic ?? true,
    },
  });

  const [imagePreview, setImagePreview] = useState(defaultValues?.image || null);
  const description = watch('description') || '';
  const charCount = description.length;

  const counterColor =
    charCount >= 480 ? 'text-rose-500' : charCount >= 400 ? 'text-orange-500' : 'text-gray-400';

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImagePreview(base64);
  };

  const clearImage = () => {
    setImagePreview(null);
  };

  const submit = (data, asDraft) => {
    onSubmit(
      {
        description: data.description,
        image: imagePreview,
        isPublic: data.isPublic === 'true' || data.isPublic === true,
      },
      { asDraft }
    );

    // Create Post spec: after saving as draft, clear the form and stay on the page.
    if (asDraft && resetOnDraftSave) {
      reset({ description: '', isPublic: true });
      setImagePreview(null);
    }
  };

  return (
    <form className="space-y-5 text-left">
      <div>
        <AIPostAssistant
          onUseContent={(text) => setValue('description', text, { shouldValidate: true, shouldDirty: true })}
        />
        <Input
          textarea
          label="Description"
          placeholder="What's on your mind?"
          error={errors.description?.message}
          maxLength={MAX_CHARS}
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 10, message: 'Description must be at least 10 characters' },
            maxLength: { value: MAX_CHARS, message: `Maximum ${MAX_CHARS} characters` },
          })}
        />
        <p className={clsx('text-xs mt-1 text-right', counterColor)}>
          {charCount} / {MAX_CHARS} characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Image (optional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-600 dark:text-gray-300 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-50 file:text-brand-700 dark:file:bg-brand-900/30 dark:file:text-brand-300 file:cursor-pointer cursor-pointer"
        />
        {imagePreview && (
          <div className="relative mt-3 inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-800"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gray-900 text-white text-sm flex items-center justify-center shadow hover:bg-rose-600"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Visibility
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="radio" value="true" {...register('isPublic')} defaultChecked />
            Public
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="radio" value="false" {...register('isPublic')} />
            Private
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          isLoading={submitting === 'draft'}
          disabled={charCount > MAX_CHARS}
          onClick={handleSubmit((data) => submit(data, true))}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          variant="primary"
          isLoading={submitting === 'publish'}
          disabled={charCount > MAX_CHARS}
          onClick={handleSubmit((data) => submit(data, false))}
        >
          Publish
        </Button>
      </div>
    </form>
  );
}
