import * as mongoose from 'mongoose'

export const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    filename: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    lastUpdated: { type: String, required: true },
})

export interface  Video {
        id: string;
        title: string;
        filename: string;
        description: string;
        author: string;
        lastUpdated: string;
}