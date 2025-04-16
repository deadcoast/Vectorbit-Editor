
import { fetchPalettes, createPalette, deletePalette } from "./api";
import axios from "axios";

jest.mock("axios");

describe("API Functions", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches palettes successfully", async () => {
    const mockData = [{ _id: 1, name: "Palette 1", colors: ["#ff0000"] }];
    axios.get.mockResolvedValue({ data: mockData });

    const palettes = await fetchPalettes();
    expect(axios.get).toHaveBeenCalledWith("/palettes");
    expect(palettes).toEqual(mockData);
  });

  it("creates a new palette successfully", async () => {
    const newPalette = { name: "New Palette", colors: ["#ff0000"] };
    const mockResponse = { _id: 1, ...newPalette };
    axios.post.mockResolvedValue({ data: mockResponse });

    const createdPalette = await createPalette(newPalette);
    expect(axios.post).toHaveBeenCalledWith("/palettes", newPalette);
    expect(createdPalette).toEqual(mockResponse);
  });

  it("deletes a palette successfully", async () => {
    axios.delete.mockResolvedValue({ data: {} });

    await deletePalette(1);
    expect(axios.delete).toHaveBeenCalledWith("/palettes/1");
  });

  it("handles API errors gracefully", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    await expect(fetchPalettes()).rejects.toThrow("Network Error");
  });
});
