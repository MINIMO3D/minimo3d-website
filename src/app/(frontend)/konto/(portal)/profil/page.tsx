import { DeleteAccountForm, PasswordForm, ProfileForm } from '@/components/konto/Forms'
import { requireCustomer, isB2B } from '@/lib/customer'

export default async function ProfilePage() {
  const c = await requireCustomer()
  return (
    <div className="stack" style={{ gap: 24, maxWidth: 820 }}>
      <h1 className="h2">{isB2B(c) ? 'Firma und Adressen' : 'Profil und Adressen'}</h1>
      <ProfileForm
        data={{
          type: c.type,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone || '',
          company: c.company || '',
          vatId: c.vatId || '',
          billing: c.billing || {},
          shippingSame: c.shippingSame !== false,
          shipping: c.shipping || {},
        }}
      />
      <PasswordForm />
      <DeleteAccountForm />
    </div>
  )
}
