// utils/formatters.ts
export const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove tudo que não for número
    const numbers = phoneNumber.replace(/\D/g, '');
    
    // Se o número já vier com @c.us, remove
    const cleanNumber = numbers.replace('@c.us', '');
  
    // Verifica se tem o tamanho correto (13 dígitos: 55 + DDD + número)
    if (cleanNumber.length === 13) {
      const country = cleanNumber.slice(0, 2);
      const areaCode = cleanNumber.slice(2, 4);
      const firstPart = cleanNumber.slice(4, 9);
      const secondPart = cleanNumber.slice(9);
      return `+${country} ${areaCode} ${firstPart}-${secondPart}`;
    }
  
    // Se tiver 12 dígitos (sem o 9 na frente)
    if (cleanNumber.length === 12) {
      const country = cleanNumber.slice(0, 2);
      const areaCode = cleanNumber.slice(2, 4);
      const firstPart = cleanNumber.slice(4, 8);
      const secondPart = cleanNumber.slice(8);
      return `+${country} ${areaCode} ${firstPart}-${secondPart}`;
    }
  
    // Se não conseguir formatar, retorna o número original limpo
    return cleanNumber;
  };