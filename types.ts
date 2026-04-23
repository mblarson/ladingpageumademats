
export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  redirect_url?: string;
  image_desktop_url: string;
  image_mobile_url: string;
  use_mobile_image: boolean;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
