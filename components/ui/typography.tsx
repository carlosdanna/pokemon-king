import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type * as React from "react";

// Order matters: size and weight come after variant so cn lets them override the variant's defaults.
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "font-heading text-4xl font-bold tracking-tight text-balance",
      h2: "font-heading text-3xl font-semibold tracking-tight",
      h3: "font-heading text-2xl font-semibold tracking-tight",
      h4: "font-heading text-xl font-semibold tracking-tight",
      lead: "text-xl text-muted-foreground",
      body: "text-base leading-7",
      small: "text-sm leading-none font-medium",
      caption: "text-xs text-muted-foreground",
      overline: "text-xs font-semibold tracking-widest uppercase",
    },
    color: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      destructive: "text-destructive",
      inherit: "text-inherit",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

const defaultTags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  lead: "p",
  body: "p",
  small: "small",
  caption: "span",
  overline: "span",
} satisfies Record<TypographyVariant, React.ElementType>;

type TypographyTag =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "small"
  | "strong"
  | "em"
  | "label"
  | "legend"
  | "figcaption"
  | "blockquote"
  | "li"
  | "dt"
  | "dd"
  | "time"
  | "abbr"
  | "code"
  | "div";

type TypographyProps<T extends TypographyTag> = {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, "color"> &
  VariantProps<typeof typographyVariants>;

function Typography<T extends TypographyTag = "p">({
  as,
  variant,
  color,
  size,
  weight,
  className,
  ...props
}: TypographyProps<T>) {
  // Generic tag props can't be checked against JSX; callers are type-checked through TypographyProps<T>.
  const Tag = (as ?? defaultTags[variant ?? "body"]) as "span";
  const rest: React.ComponentPropsWithoutRef<"span"> = props;
  return (
    <Tag
      data-slot="typography"
      className={cn(
        typographyVariants({ variant, color, size, weight }),
        className,
      )}
      {...rest}
    />
  );
}

export { Typography, typographyVariants };
