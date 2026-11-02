export const business = {
 name:'Ceylon Electronics', tagline:'Major Arduino Accessories Seller',
 subtitle:'The leading supplier for School Students & Bulk Orders in the Eastern Province.',
 address:'536, New Kalmunai Road, Kattankudi, Batticaloa 30100, Sri Lanka',
 phone:'077 861 1358', internationalPhone:'+94778611358', whatsapp:'94778611358',
 hours:'Open daily · Closes 9 PM', instagram:'https://www.instagram.com/ceyloneleckky/',
 facebook:'', tiktok:'', siteUrl:import.meta.env.VITE_SITE_URL || 'https://ceylon-electronics-catalog.ssakan439.chatgpt.site',
 map:'https://maps.google.com/maps?q=536%20New%20Kalmunai%20Road%20Kattankudy%20Sri%20Lanka&output=embed'
};
export const whatsappLink=(message:string)=>`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
