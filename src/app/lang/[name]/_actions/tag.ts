"use server";
import {
  addWordTagRelation,
  getAllWordTags,
  insertTag,
  removeWordTagRelation,
} from "~/server/queries";
import { type Tag } from "~/types/tag";

export async function addTagToWord(wordId: number, tag: Partial<Tag>) {
  let newTag: Tag;
  if (!tag.id) {
    if (!tag.text) throw new Error("Tag text is required");
    const allTags = await getAllWordTags();
    const existingTag = allTags.find((t) => t.text === tag.text);
    if (!existingTag) {
      newTag = (await insertTag({
        text: tag.text,
        type: "word",
      })) as Tag;
    } else {
      newTag = existingTag;
    }
  } else {
    newTag = tag as Tag;
  }

  // and then associate it with the word
  await addWordTagRelation(wordId, newTag.id);
}

export async function removeTagFromWord(wordId: number, tagId: number) {
  await removeWordTagRelation(wordId, tagId);
}
