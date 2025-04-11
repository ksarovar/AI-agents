export interface Slide {
  title: string;
  content: string[];
  layout: string;
  notes: string;
}

export interface PPTResponse {
  slides: Slide[];
}

export interface FormData {
  requirements: string;
  slideCount: number;
  tone: string;
  audience: string;
}