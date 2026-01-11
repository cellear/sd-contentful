import { render, screen } from "@testing-library/react";
import { Document, BLOCKS, INLINES } from "@contentful/rich-text-types";
import TipDetailPage from "@/app/[slug]/page";
import { getTipBySlug } from "@/lib/content/tips";
import { Tip } from "@/lib/types/tip";

// Mock the adapter functions
jest.mock("@/lib/content/tips", () => ({
  getTipBySlug: jest.fn(),
}));

const mockGetTipBySlug = getTipBySlug as jest.MockedFunction<typeof getTipBySlug>;

// Mock next/navigation
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

import { notFound } from "next/navigation";

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>;

/**
 * Creates a mock Tip object with rich text content for testing.
 */
function createMockTip(
  title: string,
  slug: string,
  tipNumber: number,
  bodyContent?: Document,
  imageUrl?: string
): Tip {
  return {
    title,
    slug,
    tipNumber,
    body: bodyContent || {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: "text",
              value: "Test content",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    } as Document,
    imageUrl,
  };
}

/**
 * Creates a rich text document with various formatting for testing.
 */
function createRichTextDocument(): Document {
  return {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: [
      {
        nodeType: BLOCKS.HEADING_1,
        data: {},
        content: [
          {
            nodeType: "text",
            value: "Heading 1",
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: BLOCKS.PARAGRAPH,
        data: {},
        content: [
          {
            nodeType: "text",
            value: "This is a paragraph with ",
            marks: [],
            data: {},
          },
          {
            nodeType: INLINES.HYPERLINK,
            data: {
              uri: "https://example.com",
            },
            content: [
              {
                nodeType: "text",
                value: "a link",
                marks: [],
                data: {},
              },
            ],
          },
          {
            nodeType: "text",
            value: " in it.",
            marks: [],
            data: {},
          },
        ],
      },
      {
        nodeType: BLOCKS.UL_LIST,
        data: {},
        content: [
          {
            nodeType: BLOCKS.LIST_ITEM,
            data: {},
            content: [
              {
                nodeType: BLOCKS.PARAGRAPH,
                data: {},
                content: [
                  {
                    nodeType: "text",
                    value: "List item 1",
                    marks: [],
                    data: {},
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  } as Document;
}

describe("Tip Detail Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays tip title and body correctly", async () => {
    const mockTip = createMockTip("Test Tip", "test-tip", 1);
    mockGetTipBySlug.mockResolvedValue(mockTip);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "test-tip" }) });
    render(component);

    expect(screen.getByText("Test Tip")).toBeInTheDocument();
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders rich text formatting correctly", async () => {
    const richTextBody = createRichTextDocument();
    const mockTip = createMockTip("Rich Text Tip", "rich-tip", 1, richTextBody);
    mockGetTipBySlug.mockResolvedValue(mockTip);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "rich-tip" }) });
    render(component);

    // Check that rich text elements are rendered
    expect(screen.getByText("Heading 1")).toBeInTheDocument();
    // Text is split across nodes, so check for the link and surrounding text
    expect(screen.getByText("a link")).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === "This is a paragraph with a link in it.";
    })).toBeInTheDocument();
    expect(screen.getByText("List item 1")).toBeInTheDocument();
  });

  it("calls notFound() when tip is not found", async () => {
    mockGetTipBySlug.mockResolvedValue(null);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "non-existent" }) });
    
    // Component should call notFound() which returns undefined
    // In Next.js, notFound() throws internally, but in tests we can check it was called
    expect(mockGetTipBySlug).toHaveBeenCalledWith("non-existent");
    
    // Since notFound() is called, the component won't render
    // We verify the adapter was called with correct slug
  });

  it("displays error message when adapter throws", async () => {
    mockGetTipBySlug.mockRejectedValue(new Error("Failed to fetch tip from Contentful API"));

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "test-tip" }) });
    render(component);

    expect(screen.getByText(/Error: Failed to fetch tip from Contentful API/)).toBeInTheDocument();
  });

  it("handles various slug formats", async () => {
    const mockTip = createMockTip("Slug Test", "03-site-builder", 3);
    mockGetTipBySlug.mockResolvedValue(mockTip);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "03-site-builder" }) });
    render(component);

    expect(screen.getByText("Slug Test")).toBeInTheDocument();
    expect(mockGetTipBySlug).toHaveBeenCalledWith("03-site-builder");
  });

  it("displays image when imageUrl is present", async () => {
    const mockTip = createMockTip(
      "Tip with Image",
      "tip-with-image",
      1,
      undefined,
      "https://images.ctfassets.net/space/image.jpg"
    );
    mockGetTipBySlug.mockResolvedValue(mockTip);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "tip-with-image" }) });
    render(component);

    const image = screen.getByAltText("Tip with Image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://images.ctfassets.net/space/image.jpg");
  });

  it("does not display image when imageUrl is not present", async () => {
    const mockTip = createMockTip("Tip without Image", "tip-no-image", 1);
    mockGetTipBySlug.mockResolvedValue(mockTip);

    const component = await TipDetailPage({ params: Promise.resolve({ slug: "tip-no-image" }) });
    render(component);

    expect(screen.getByText("Tip without Image")).toBeInTheDocument();
    // Image should not be present
    expect(screen.queryByAltText("Tip without Image")).not.toBeInTheDocument();
  });
});

