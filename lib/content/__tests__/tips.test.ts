import { Entry } from "contentful";
import { BLOCKS, Document } from "@contentful/rich-text-types";
import { getAllTips, getTipBySlug } from "../tips";
import { Tip } from "@/lib/types/tip";

// Mock the contentful client
jest.mock("../contentful", () => ({
  contentfulClient: {
    getEntries: jest.fn(),
  },
}));

import { contentfulClient } from "../contentful";

const mockClient = contentfulClient as jest.Mocked<typeof contentfulClient>;

/**
 * Creates a mock Contentful entry matching the API structure.
 */
function createMockEntry(
  title: string,
  slug: string,
  tipNumber: number,
  body: Document,
  imageUrl?: string
): Entry<any> {
  const fields: any = {
    title,
    slug,
    tipNumber,
    body,
  };

  // Add image field if imageUrl is provided
  if (imageUrl) {
    fields.image = {
      sys: {
        id: `image-${slug}`,
        type: "Asset",
        linkType: "Asset",
      },
      fields: {
        file: {
          url: imageUrl,
          fileName: `${slug}.jpg`,
          contentType: "image/jpeg",
        },
      },
    };
  }

  return {
    sys: {
      id: `mock-${slug}`,
      type: "Entry",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      revision: 1,
      contentType: {
        sys: {
          type: "Link",
          linkType: "ContentType",
          id: "tip",
        },
      },
      metadata: {
        tags: [],
      },
    },
    fields,
  } as unknown as Entry<any>;
}

describe("getAllTips", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch and transform all tips, ordered by tipNumber", async () => {
    const mockBody: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };

    const mockEntries = [
      createMockEntry("Tip 3", "tip-3", 3, mockBody),
      createMockEntry("Tip 1", "tip-1", 1, mockBody),
      createMockEntry("Tip 2", "tip-2", 2, mockBody),
    ];

    mockClient.getEntries.mockResolvedValue({
      items: mockEntries,
      total: 3,
      skip: 0,
      limit: 100,
    } as any);

    const tips = await getAllTips();

    expect(tips).toHaveLength(3);
    expect(tips[0].tipNumber).toBe(1);
    expect(tips[1].tipNumber).toBe(2);
    expect(tips[2].tipNumber).toBe(3);
    expect(tips[0].slug).toBe("tip-1");
  });

  it("should filter out tips with missing required fields", async () => {
    const mockBody: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };

    const mockEntries = [
      createMockEntry("Valid Tip", "valid", 1, mockBody),
      // Missing title
      {
        sys: {
          id: "invalid-1",
          type: "Entry",
          metadata: { tags: [] },
        },
        fields: {
          slug: "invalid-1",
          tipNumber: 2,
          body: mockBody,
        },
      } as unknown as Entry<any>,
      // Missing slug
      {
        sys: {
          id: "invalid-2",
          type: "Entry",
          metadata: { tags: [] },
        },
        fields: {
          title: "Invalid Tip",
          tipNumber: 3,
          body: mockBody,
        },
      } as unknown as Entry<any>,
    ];

    mockClient.getEntries.mockResolvedValue({
      items: mockEntries,
      total: 3,
      skip: 0,
      limit: 100,
    } as any);

    const tips = await getAllTips();

    expect(tips).toHaveLength(1);
    expect(tips[0].slug).toBe("valid");
  });

  it("should extract image URL when image is present", async () => {
    const mockBody: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };

    const mockEntry = createMockEntry(
      "Tip with Image",
      "tip-with-image",
      1,
      mockBody,
      "//images.ctfassets.net/space/image.jpg"
    );

    mockClient.getEntries.mockResolvedValue({
      items: [mockEntry],
      total: 1,
      skip: 0,
      limit: 100,
    } as any);

    const tips = await getAllTips();

    expect(tips).toHaveLength(1);
    expect(tips[0].imageUrl).toBe("https://images.ctfassets.net/space/image.jpg");
  });

  it("should handle tips without images (imageUrl undefined)", async () => {
    const mockBody: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };

    const mockEntry = createMockEntry("Tip without Image", "tip-no-image", 1, mockBody);

    mockClient.getEntries.mockResolvedValue({
      items: [mockEntry],
      total: 1,
      skip: 0,
      limit: 100,
    } as any);

    const tips = await getAllTips();

    expect(tips).toHaveLength(1);
    expect(tips[0].imageUrl).toBeUndefined();
  });

  it("should throw detailed error message when Contentful is unavailable", async () => {
    mockClient.getEntries.mockRejectedValue(new Error("Network error"));

    await expect(getAllTips()).rejects.toThrow("Failed to fetch tips from Contentful API");
  });
});

describe("getTipBySlug", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return Tip when found", async () => {
    const mockBody: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [],
    };

    const mockEntry = createMockEntry("Test Tip", "test-slug", 1, mockBody);

    mockClient.getEntries.mockResolvedValue({
      items: [mockEntry],
      total: 1,
      skip: 0,
      limit: 1,
    } as any);

    const tip = await getTipBySlug("test-slug");

    expect(tip).not.toBeNull();
    expect(tip?.slug).toBe("test-slug");
    expect(tip?.title).toBe("Test Tip");
  });

  it("should return null when not found", async () => {
    mockClient.getEntries.mockResolvedValue({
      items: [],
      total: 0,
      skip: 0,
      limit: 1,
    } as any);

    const tip = await getTipBySlug("non-existent");

    expect(tip).toBeNull();
  });

  it("should return null when entry is invalid (missing fields)", async () => {
    const invalidEntry = {
      sys: {
        id: "invalid",
        type: "Entry",
        metadata: { tags: [] },
      },
      fields: {
        title: "Invalid",
        // Missing slug, tipNumber, body
      },
    } as unknown as Entry<any>;

    mockClient.getEntries.mockResolvedValue({
      items: [invalidEntry],
      total: 1,
      skip: 0,
      limit: 1,
    } as any);

    const tip = await getTipBySlug("invalid");

    expect(tip).toBeNull();
  });

  it("should throw detailed error message when Contentful is unavailable", async () => {
    mockClient.getEntries.mockRejectedValue(new Error("Network error"));

    await expect(getTipBySlug("test")).rejects.toThrow("Failed to fetch tip");
  });
});

