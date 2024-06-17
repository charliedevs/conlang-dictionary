"use server";
import {
  addWordTagRelation,
  getAllWordTags,
  insertTag,
} from "~/server/queries";

export async function addTagToWord(wordId: number, tagText: string) {
  // TODO: if tag exists then don't add it to tags table
  const tags = await getAllWordTags();

  let tag = tags.find((tag) => tag.text === tagText);

  if (!tag) {
    // Add tag to Tags table first
    tag = await insertTag({
      text: tagText,
      type: "word",
    });
  }
  // and then associate it with the word
  await addWordTagRelation(wordId, tag.id);
}
