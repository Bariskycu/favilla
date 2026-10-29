import { z } from 'zod';

// Luhn Algorithm Implementation
const luhnCheck = (val: string) => {
    // Remove all non-digit characters
    const cleanVal = val.replace(/\D/g, '');

    let checksum = 0;
    let second = false;

    // Process valid digits from right to left
    for (let i = cleanVal.length - 1; i >= 0; i--) {
        let digit = parseInt(cleanVal[i]);

        if (second) {
            digit = digit * 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        checksum += digit;
        second = !second;
    }

    return (checksum % 10) === 0;
};

export const addressSchema = z.object({
    title: z.string().min(2, "Başlık en az 2 karakter olmalıdır"), // Title min 2 chars
    line1: z.string().min(5, "Adres çok kısa"), // Address too short
    city: z.string().min(2, "Şehir adı geçersiz"), // Invalid city
    zip: z.string().min(3, "Posta kodu geçersiz"), // Invalid zip
    country: z.string().min(2, "Ülke adı geçersiz"), // Invalid country
});

export type AddressFormData = z.infer<typeof addressSchema>;

export const paymentSchema = z.object({
    cardName: z.string().min(3, "Kart üzerindeki isim gereklidir"), // Card name required
    cardNumber: z.string()
        .regex(/^\d{16}$/, "Kart numarası 16 haneli olmalıdır") // Must be 16 digits
        .refine(luhnCheck, "Geçersiz kart numarası"), // Invalid card number
    expiry: z.string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: AA/YY (Örn: 12/25)") // Format MM/YY
        .refine((val) => {
            if (!val.includes('/')) return false;
            const [monthStr, yearStr] = val.split('/');
            const month = parseInt(monthStr);
            const year = parseInt(`20${yearStr}`); // Assume 20xx

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // 1-12

            if (year < currentYear) return false;
            if (year === currentYear && month < currentMonth) return false;

            return true;
        }, "Kartın süresi dolmuş"), // Card expired
    cvv: z.string().regex(/^\d{3}$/, "CVV 3 haneli olmalıdır") // CVV must be 3 digits
});

export type PaymentFormData = z.infer<typeof paymentSchema>;
