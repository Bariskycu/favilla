// src/controllers/userController.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { findById, findByIdWithPassword, updateUser, updateUserRole, findByEmailWithRole } from '../models/userModel';
import { addAddress, getUserAddresses as fetchUserAddresses, deleteAddress, updateAddress } from '../models/addressModel';
import bcrypt from 'bcrypt';
import { isValidPassword } from '../utils/validators';
import { CustomError, asyncHandler } from '../middlewares/errorHandler';
import { sendSuccess, sendCreated, sendUpdated, sendDeleted } from '../utils/response';

// Profil Bilgilerini Getir (Adreslerle Birlikte)
export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  
  // Paralel olarak hem kullanıcıyı hem adresleri çekiyoruz (Performans için)
  const [user, addresses] = await Promise.all([
    findById(userId),
    fetchUserAddresses(userId)
  ]);

  if (!user) {
    throw new CustomError('Kullanıcı bulunamadı', 404);
  }

  sendSuccess(res, { ...user, addresses });
});

// Profil Güncelle
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, phone, currentPassword, newPassword, confirmPassword } = req.body;

  // Email güncellenemez - req.body'den çıkar
  const updateData: any = {};

  // Name validasyonu ve güncelleme
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      throw new CustomError('İsim boş olamaz.', 400);
    }
    updateData.name = name.trim();
  }

  // Phone validasyonu ve güncelleme
  if (phone !== undefined) {
    if (phone && phone.length > 20) {
      throw new CustomError('Telefon numarası en fazla 20 karakter olabilir.', 400);
    }
    updateData.phone = phone;
  }

  // Şifre güncelleme kontrolü
  if (newPassword || currentPassword || confirmPassword) {
    // Şifre güncelleme için tüm alanlar gerekli
    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new CustomError('Şifre güncelleme için mevcut şifre, yeni şifre ve yeni şifre tekrar alanları zorunludur.', 400);
    }

    // Yeni şifre ve tekrar eşleşmeli
    if (newPassword !== confirmPassword) {
      throw new CustomError('Yeni şifre ve yeni şifre tekrar eşleşmiyor.', 400);
    }

    // Şifre güçlülük kontrolü
    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.valid) {
      throw new CustomError(passwordValidation.message || 'Şifre geçersiz', 400);
    }

    // Mevcut şifreyi kontrol et
    const user = await findByIdWithPassword(userId);
    if (!user || !user.password) {
      throw new CustomError('Kullanıcı bulunamadı.', 404);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new CustomError('Mevcut şifre hatalı.', 401);
    }

    // Yeni şifreyi ekle
    updateData.password = newPassword;
  }

  // Modeldeki güncellenmiş updateUser fonksiyonunu çağır
  const updatedUser = await updateUser(userId, updateData);
  
  if (!updatedUser) {
    throw new CustomError('Kullanıcı bulunamadı.', 404);
  }

  sendUpdated(res, updatedUser);
});

// Adresleri Getir
export const getUserAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const addresses = await fetchUserAddresses(userId);
  sendSuccess(res, addresses);
});

// Adres Ekle
export const createUserAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { title, line1, city, zip, country } = req.body;
  
  if (!title || !line1 || !city || !country) {
    throw new CustomError('Eksik adres bilgileri', 400);
  }

  const newAddress = await addAddress(userId, { title, line1, city, zip, country });
  sendCreated(res, newAddress);
});

// Adres Güncelle
export const editUserAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const { title, line1, city, zip, country } = req.body;
  
  const updatedAddress = await updateAddress(id, userId, { title, line1, city, zip, country });
  
  if (!updatedAddress) {
    throw new CustomError('Adres bulunamadı veya size ait değil', 404);
  }
  
  sendUpdated(res, updatedAddress);
});

// Adres Sil
export const removeUserAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  
  const success = await deleteAddress(id, userId);
  if (!success) {
    throw new CustomError('Adres bulunamadı veya size ait değil', 404);
  }
  
  sendDeleted(res, { message: 'Adres silindi' });
});

// Kullanıcı rolünü güncelle (Admin işlemi)
export const changeUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Role validasyonu
  if (!role || !['customer', 'admin'].includes(role)) {
    throw new CustomError('Geçerli bir rol belirtilmelidir (customer veya admin)', 400);
  }

  // Kullanıcıyı bul
  const user = await findById(userId);
  if (!user) {
    throw new CustomError('Kullanıcı bulunamadı', 404);
  }

  // Rolü güncelle
  const updatedUser = await updateUserRole(userId, role as 'customer' | 'admin');
  
  if (!updatedUser) {
    throw new CustomError('Rol güncellenemedi', 500);
  }

  sendUpdated(res, updatedUser, { message: `Kullanıcı rolü ${role} olarak güncellendi` });
});