import { supabase } from '../config/supabase';

export const uploadGroupPhoto = async (groupId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${groupId}.${fileExt}`;
  const filePath = `group-photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('group-photos')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('group-photos')
    .getPublicUrl(filePath);

  // Update group with new photo URL
  const { error: updateError } = await supabase
    .from('groups')
    .update({ photo_url: publicUrl })
    .eq('id', groupId);

  if (updateError) throw updateError;

  return publicUrl;
};

export const deleteGroupPhoto = async (groupId: string) => {
  const { data: group } = await supabase
    .from('groups')
    .select('photo_url')
    .eq('id', groupId)
    .single();

  if (group?.photo_url) {
    const fileName = group.photo_url.split('/').pop();
    const { error: deleteError } = await supabase.storage
      .from('group-photos')
      .remove([`group-photos/${fileName}`]);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from('groups')
      .update({ photo_url: null })
      .eq('id', groupId);

    if (updateError) throw updateError;
  }
}; 