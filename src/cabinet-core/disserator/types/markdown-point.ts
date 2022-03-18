import { Card } from "cabinet-node";
import { v4 } from "uuid";
import { MarkdownPointCard } from "./markdown-point-card";

export class MarkdownPoint {
  id: string = v4();
  mdMarkup = "";
  htmlMarkup = "";
  content = '';
  line = 0;
  cards: MarkdownPointCard[] = [];
  parentId: string | null = null;
  subLevel: number = 0;
  headingLevel: number | null = 0;
  isHeading: boolean = false;

}
