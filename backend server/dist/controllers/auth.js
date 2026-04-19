import { prisma } from '../configs/prisma.js';
// Upsert a user record. Expected body: { id, email, name, image }
export const upsertUser = async (req, res) => {
    try {
        const { id, email, name, image } = req.body;
        if (!id || !email) {
            return res.status(400).json({ message: 'id and email are required' });
        }
        const user = await prisma.user.upsert({
            where: { id },
            update: { email, name: name ?? '', image: image ?? '' },
            create: { id, email, name: name ?? '', image: image ?? '' }
        });
        return res.json({ user });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || 'Server error' });
    }
};
export default upsertUser;
