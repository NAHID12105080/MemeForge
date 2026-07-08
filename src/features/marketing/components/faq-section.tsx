import { SectionHeading } from "@/components/composed/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is MemeForge free to use?",
    answer:
      "Yes. The core editor, template library, and AI caption tools are free. A Pro tier with higher AI usage limits is planned but not yet available.",
  },
  {
    question: "How does the AI caption generator work?",
    answer:
      "It's powered by Claude. Describe your meme or paste a draft caption, and it can generate suggestions, rewrite for tone, translate, or punch up the humor — all insertable as editable text layers.",
  },
  {
    question: "Can I upload my own images?",
    answer:
      "Yes — drag and drop, use the file picker, or paste directly from your clipboard. Uploaded images support the same filters, crop, and layer tools as templates.",
  },
  {
    question: "What formats can I export to?",
    answer:
      "PNG, JPEG, WEBP, and SVG, including transparent backgrounds and high-resolution exports. You can also copy directly to your clipboard or share to social platforms.",
  },
  {
    question: "Is MemeForge open source?",
    answer:
      "Yes, MemeForge is fully open source under the MIT license. The code, database schema, and design system are all available in the repository.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading align="center" eyebrow="FAQ" title="Frequently asked questions" />
      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
