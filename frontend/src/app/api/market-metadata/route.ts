import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const DATA_DIR = join(process.cwd(), "data");

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function getMetadataPath(marketId: string) {
  await ensureDataDir();
  return join(DATA_DIR, `market_${marketId}.json`);
}

export async function POST(req: Request) {
  try {
    const { marketId, question, image } = await req.json();

    if (!marketId) {
      return Response.json({ error: "marketId is required" }, { status: 400 });
    }

    const path = await getMetadataPath(marketId);
    const data = {
      marketId,
      question: question || null,
      image: image || null,
      timestamp: new Date().toISOString(),
    };

    await writeFile(path, JSON.stringify(data, null, 2));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Error saving market metadata:", error);
    return Response.json(
      { error: "Failed to save market metadata" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return Response.json({ error: "marketId is required" }, { status: 400 });
    }

    const path = await getMetadataPath(marketId);

    try {
      const content = await readFile(path, "utf-8");
      const data = JSON.parse(content);
      return Response.json(data);
    } catch (fileError: any) {
      if (fileError.code === "ENOENT") {
        return Response.json({ question: null, image: null });
      }
      throw fileError;
    }
  } catch (error) {
    console.error("Error fetching market metadata:", error);
    return Response.json(
      { error: "Failed to fetch market metadata" },
      { status: 500 }
    );
  }
}
