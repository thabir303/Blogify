// src/msw.js
import { rest } from 'msw';

export const handlers = [

    rest.post('/blogs/create/', (req,res, ctx) => {
        return res( ctx.status(201),
        ctx.json({
            id: 1,
            title: req.body.title,
            content: req.body.content,
        })
        );
    }),

    rest.put('/blogs/:blog_id/edit/', (req,res,ctx) => {
        return res( ctx.status(200),
        ctx.json({
            id:req.params.blog_id,
            title: req.body.title,
            content: req.body.content,
        })
        );
    }),

    rest.delete('/blogs/:blog_id/', (req,res,ctx) =>{
        return res( ctx.status(200),
        ctx.json({message: 'Blog deleted successfully.'})
        );
    }),

];