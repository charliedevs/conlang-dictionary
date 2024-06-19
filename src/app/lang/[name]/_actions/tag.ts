"use server";
import { addWordTagRelation, insertTag } from "~/server/queries";
import { type Tag } from "~/types/tag";

export async function addTagToWord(wordId: number, tag: Partial<Tag>) {
  let newTag: Tag;
  if (!tag.id) {
    if (!tag.text) throw new Error("Tag text is required");
    // Add new tag to Tags table first
    newTag = (await insertTag({
      text: tag.text,
      type: "word",
    })) as Tag;
  } else {
    newTag = tag as Tag;
  }

  // and then associate it with the word
  await addWordTagRelation(wordId, newTag.id);
}
