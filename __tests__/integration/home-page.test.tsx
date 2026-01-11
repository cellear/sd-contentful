import { render, screen } from "@testing-library/react";
import { Document, BLOCKS } from "@contentful/rich-text-types";
import Home from "@/app/page";
import { getAllTips } from "@/lib/content/tips";
import { Tip } from "@/lib/types/tip";

// Mock the adapter functions
jest.mock("@/lib/content/tips", () => ({
  getAllTips: jest.fn(),
}));

const mockGetAllTips = getAllTips as jest.MockedFunction<typeof getAllTips>;

/**
 * Creates a mock Tip object for testing.
 */
function createMockTip(
  title: string,
  slug: string,
  tipNumber: number
): Tip {
  return {
    title,
    slug,
    tipNumber,
    body: {
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
  };
}

describe("Home Page Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays all tips in order by tipNumber", async () => {
    // Mock adapter returns sorted tips (adapter handles sorting)
    const mockTips: Tip[] = [
      createMockTip("First Tip", "first-tip", 1),
      createMockTip("Second Tip", "second-tip", 2),
      createMockTip("Third Tip", "third-tip", 3),
    ];

    mockGetAllTips.mockResolvedValue(mockTips);

    const component = await Home();
    const { container } = render(component);

    // Check that all tips are displayed
    expect(screen.getByText("1: First Tip")).toBeInTheDocument();
    expect(screen.getByText("2: Second Tip")).toBeInTheDocument();
    expect(screen.getByText("3: Third Tip")).toBeInTheDocument();

    // Verify tips are in order (check DOM order)
    const tipElements = container.querySelectorAll("li");
    expect(tipElements[0]).toHaveTextContent("1: First Tip");
    expect(tipElements[1]).toHaveTextContent("2: Second Tip");
    expect(tipElements[2]).toHaveTextContent("3: Third Tip");
  });

  it("displays empty state when no tips are available", async () => {
    mockGetAllTips.mockResolvedValue([]);

    const component = await Home();
    render(component);

    expect(
      screen.getByText(
        "No tips found. Make sure you have published at least one Tip entry in Contentful."
      )
    ).toBeInTheDocument();
  });

  it("displays error message when adapter throws", async () => {
    mockGetAllTips.mockRejectedValue(new Error("Failed to fetch tips from Contentful API"));

    const component = await Home();
    render(component);

    expect(screen.getByText(/Error: Failed to fetch tips from Contentful API/)).toBeInTheDocument();
  });

  it("makes tips clickable with correct navigation links", async () => {
    const mockTips: Tip[] = [
      createMockTip("Test Tip", "test-tip", 1),
    ];

    mockGetAllTips.mockResolvedValue(mockTips);

    const component = await Home();
    const { container } = render(component);

    // Find the link element
    const link = container.querySelector('a[href="/test-tip"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent("1: Test Tip");
  });

  it("handles multiple tips with correct links", async () => {
    const mockTips: Tip[] = [
      createMockTip("Tip One", "tip-one", 1),
      createMockTip("Tip Two", "tip-two", 2),
    ];

    mockGetAllTips.mockResolvedValue(mockTips);

    const component = await Home();
    const { container } = render(component);

    // Check both links exist
    expect(container.querySelector('a[href="/tip-one"]')).toBeInTheDocument();
    expect(container.querySelector('a[href="/tip-two"]')).toBeInTheDocument();
  });
});

