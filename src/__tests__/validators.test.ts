/**
 * Tests unitarios: src/lib/validators/*.schema.ts
 * Módulo: Validación Zod de formularios
 */
import { clienteSchema } from '@/lib/validators/client.schema';
import { userSchema, loginSchema, forgotPasswordSchema } from '@/lib/validators/user.schema';
import { zonaSchema } from '@/lib/validators/zone.schema';

describe('Zod Validators', () => {
  // ============================
  // clienteSchema
  // ============================
  describe('clienteSchema', () => {
    const validCliente = {
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      nombreCompleto: 'Juan Carlos Pérez García',
      telefono: '987654321',
      email: 'juan@email.com',
      direccion: 'Av. Lima 123',
      departamentoId: '15',
      provinciaId: '1501',
      distritoId: '150101',
      zonaId: 'zona-001',
      referencia: 'Frente al parque',
      latitud: -12.046,
      longitud: -77.042,
    };

    it('valida un cliente completo correctamente', () => {
      const result = clienteSchema.safeParse(validCliente);
      expect(result.success).toBe(true);
    });

    it('acepta campos opcionales vacíos', () => {
      const { telefono, email, referencia, ...required } = validCliente;
      const result = clienteSchema.safeParse(required);
      expect(result.success).toBe(true);
    });

    it('rechaza tipo de documento inválido', () => {
      const result = clienteSchema.safeParse({ ...validCliente, tipoDocumento: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('rechaza documento con menos de 8 caracteres', () => {
      const result = clienteSchema.safeParse({ ...validCliente, numeroDocumento: '1234' });
      expect(result.success).toBe(false);
    });

    it('rechaza nombre menor a 3 caracteres', () => {
      const result = clienteSchema.safeParse({ ...validCliente, nombreCompleto: 'AB' });
      expect(result.success).toBe(false);
    });

    it('rechaza nombre vacío', () => {
      const result = clienteSchema.safeParse({ ...validCliente, nombreCompleto: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza email inválido', () => {
      const result = clienteSchema.safeParse({ ...validCliente, email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('acepta email vacío (string literal)', () => {
      const result = clienteSchema.safeParse({ ...validCliente, email: '' });
      expect(result.success).toBe(true);
    });

    it('rechaza sin departamentoId', () => {
      const result = clienteSchema.safeParse({ ...validCliente, departamentoId: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza sin provinciaId', () => {
      const result = clienteSchema.safeParse({ ...validCliente, provinciaId: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza sin distritoId', () => {
      const result = clienteSchema.safeParse({ ...validCliente, distritoId: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza sin zonaId', () => {
      const result = clienteSchema.safeParse({ ...validCliente, zonaId: '' });
      expect(result.success).toBe(false);
    });

    it('acepta todos los tipos de documento válidos', () => {
      ['DNI', 'RUC', 'CE', 'PASAPORTE'].forEach(tipo => {
        const result = clienteSchema.safeParse({ ...validCliente, tipoDocumento: tipo });
        expect(result.success).toBe(true);
      });
    });
  });

  // ============================
  // userSchema
  // ============================
  describe('userSchema', () => {
    const validUser = {
      email: 'user@empresa.com',
      nombre: 'Carlos',
      apellidos: 'Mendoza',
      telefono: '999888777',
      usertype: 'supervisor',
      companiId: 'company-001',
      password: 'secret123',
    };

    it('valida un usuario completo', () => {
      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('rechaza email inválido', () => {
      const result = userSchema.safeParse({ ...validUser, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('rechaza nombre vacío', () => {
      const result = userSchema.safeParse({ ...validUser, nombre: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza apellidos vacío', () => {
      const result = userSchema.safeParse({ ...validUser, apellidos: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza usertype inválido', () => {
      const result = userSchema.safeParse({ ...validUser, usertype: 'hacker' });
      expect(result.success).toBe(false);
    });

    it('acepta todos los roles válidos', () => {
      ['root', 'administrador', 'supervisor', 'operario', 'lector'].forEach(role => {
        const result = userSchema.safeParse({ ...validUser, usertype: role });
        expect(result.success).toBe(true);
      });
    });

    it('rechaza companiId vacío', () => {
      const result = userSchema.safeParse({ ...validUser, companiId: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza password menor a 6 caracteres', () => {
      const result = userSchema.safeParse({ ...validUser, password: '12345' });
      expect(result.success).toBe(false);
    });

    it('acepta sin password (opcional)', () => {
      const { password, ...noPass } = validUser;
      const result = userSchema.safeParse(noPass);
      expect(result.success).toBe(true);
    });

    it('acepta campos opcionales de ubicación', () => {
      const result = userSchema.safeParse({
        ...validUser,
        departamentoId: '15',
        provinciaId: '1501',
        distritoId: '150101',
      });
      expect(result.success).toBe(true);
    });
  });

  // ============================
  // loginSchema
  // ============================
  describe('loginSchema', () => {
    it('valida login correcto', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com', password: 'pass123' });
      expect(result.success).toBe(true);
    });

    it('rechaza email inválido', () => {
      const result = loginSchema.safeParse({ email: 'invalid', password: 'pass' });
      expect(result.success).toBe(false);
    });

    it('rechaza password vacío', () => {
      const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
      expect(result.success).toBe(false);
    });
  });

  // ============================
  // forgotPasswordSchema
  // ============================
  describe('forgotPasswordSchema', () => {
    it('valida email correcto', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'user@test.com' });
      expect(result.success).toBe(true);
    });

    it('rechaza email inválido', () => {
      const result = forgotPasswordSchema.safeParse({ email: 'not-email' });
      expect(result.success).toBe(false);
    });
  });

  // ============================
  // zonaSchema
  // ============================
  describe('zonaSchema', () => {
    const validZona = {
      codigo: 'ZN-001',
      nombre: 'Zona Norte A',
      descripcion: 'Sector norte del distrito',
      departamentoId: '15',
      provinciaId: '1501',
      distritoId: '150101',
      activo: true,
    };

    it('valida una zona completa', () => {
      const result = zonaSchema.safeParse(validZona);
      expect(result.success).toBe(true);
    });

    it('rechaza código vacío', () => {
      const result = zonaSchema.safeParse({ ...validZona, codigo: '' });
      expect(result.success).toBe(false);
    });

    it('rechaza nombre menor a 3 caracteres', () => {
      const result = zonaSchema.safeParse({ ...validZona, nombre: 'ZN' });
      expect(result.success).toBe(false);
    });

    it('acepta sin descripción', () => {
      const { descripcion, ...sinDesc } = validZona;
      const result = zonaSchema.safeParse(sinDesc);
      expect(result.success).toBe(true);
    });

    it('rechaza sin departamentoId', () => {
      const result = zonaSchema.safeParse({ ...validZona, departamentoId: '' });
      expect(result.success).toBe(false);
    });

    it('acepta activo true y false', () => {
      expect(zonaSchema.safeParse({ ...validZona, activo: true }).success).toBe(true);
      expect(zonaSchema.safeParse({ ...validZona, activo: false }).success).toBe(true);
    });

    it('rechaza activo no booleano', () => {
      const result = zonaSchema.safeParse({ ...validZona, activo: 'si' });
      expect(result.success).toBe(false);
    });
  });
});
