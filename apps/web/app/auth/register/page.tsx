export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Citizen Registration</h1>
      <form className="flex flex-col gap-4 w-full max-w-sm">
        <input type="text" placeholder="Full Name" className="p-3 bg-gray-900 rounded border border-gray-700" />
        <input type="email" placeholder="Email Address" className="p-3 bg-gray-900 rounded border border-gray-700" />
        <button className="p-3 bg-blue-600 rounded hover:bg-blue-700">Register Now</button>
      </form>
    </div>
  );
}
