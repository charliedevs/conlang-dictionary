import { db } from "~/server/db";

const mockUrls = [
  "https://utfs.io/f/e1db774b-07ce-41fa-ad86-5fa1b94f7a2c-eqkwve.png",
  "https://utfs.io/f/566e8217-7008-4926-8558-339f8d06709f-6tsut.png",
  "https://utfs.io/f/f00bfacb-c874-4d63-8b53-6252b325e6d3-n84tnq.png",
  "https://utfs.io/f/1fbbbc2b-b379-4e21-bc09-2a2a34ac14a5-z7psj.png",
  "https://utfs.io/f/4c011776-0c63-4961-ad3a-99197efbf4e4-4kiq1o.png",
];

const mockImages = mockUrls.map((url, index) => ({
  id: index + 1,
  url,
  name: `Image ${index + 1}`,
}));

export default async function HomePage() {
  const posts = await db.query.posts.findMany();
  console.log(posts);
  return (
    <main className="p-4">
      <div className="flex flex-wrap gap-4">
        {posts.map((post) => (
          <div key={post.id} className="w-48">
            {post.name}
          </div>
        ))}
        {[...mockImages, ...mockImages, ...mockImages].map((image, index) => (
          <div key={image.id + index} className="w-48">
            <img src={image.url} alt={image.name} />
          </div>
        ))}
      </div>
      Tutorial in progress
    </main>
  );
}
