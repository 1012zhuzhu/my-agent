import { embed } from "./embedding";
import * as lancedb from '@lancedb/lancedb';

export async function search(
    query: string,
    table: lancedb.Table
){
    const queryVector = await embed(query)

    const result = await table.vectorSearch(queryVector).distanceType('cosine').select(['text','source','_distance']).limit(5).toArray()

    return result.filter(
        item => item._distance < 0.5
    )
}