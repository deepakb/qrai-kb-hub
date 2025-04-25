import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, gt, sql, and, inArray, eq } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { resources } from '../db/schema/resources';

const embeddingModel = openai.embedding('text-embedding-ada-002');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string, userId?: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  // If userId is provided, only search resources owned by this user
  if (userId) {
    // Get resources that belong to this user
    const userResources = await db.select({ id: resources.id })
      .from(resources)
      .where(eq(resources.userId, userId));

    const resourceIds = userResources.map(r => r.id);

    // If user has no resources, return empty result
    if (resourceIds.length === 0) {
      return [];
    }

    // Use raw SQL for combined conditions
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(sql`${similarity} > 0.5 AND ${embeddings.resourceId} IN (${resourceIds.join(',')})`)
      .orderBy((eb) => desc(similarity))
      .limit(4);

    return similarGuides;
  } else {
    // Query for all resources (no user filter)
    const similarGuides = await db
      .select({ name: embeddings.content, similarity })
      .from(embeddings)
      .where(sql`${similarity} > 0.5`)
      .orderBy((eb) => desc(similarity))
      .limit(4);

    return similarGuides;
  }
};