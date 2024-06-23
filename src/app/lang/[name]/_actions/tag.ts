"use server";
import {
  addWordTagRelation,
  getWordTagsForUser,
  insertTag,
  removeWordTagRelation,
} from "~/server/queries";
import { type Tag } from "~/types/tag";

export type TagAdd = Pick<Tag, "text"> & Partial<Tag>;

export async function addTagToWord(wordId: number, tag: TagAdd) {
  let newTag: Tag;
  if (!tag.id) {
    const allTags = await getWordTagsForUser();
    const existingTag = allTags.find((t) => t.text === tag.text);
    if (!existingTag) {
      newTag = (await insertTag({
        text: tag.text,
        type: "word",
        color: tag.color,
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
