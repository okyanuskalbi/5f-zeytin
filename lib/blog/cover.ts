import photos from "@/lib/media/editorial-photos.json";
import type { V3Image } from "@/lib/media/v3-assets";
import type { BlogPost } from "./posts";

/** One approved cover per article: home page, blog list, article and share image all read it here. */
export function blogCover(post: BlogPost): V3Image {
  return photos.assets[post.imageKey];
}
