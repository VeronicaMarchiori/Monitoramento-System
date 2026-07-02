export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 animate-pulse">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white pb-20">
        <div className="p-4">
          <div className="w-20 h-8 bg-white/20 rounded mb-6"></div>
          
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full bg-white/20 mb-4"></div>
            <div className="w-48 h-6 bg-white/20 rounded mb-2"></div>
            <div className="w-32 h-4 bg-white/20 rounded mb-2"></div>
            <div className="w-24 h-3 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content Cards */}
      <div className="px-4 -mt-12 pb-6 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 h-24"></div>
          <div className="bg-white rounded-xl p-4 h-24"></div>
        </div>

        {/* Cards */}
        <div className="bg-white rounded-xl h-48"></div>
        <div className="bg-white rounded-xl h-56"></div>
        <div className="bg-white rounded-xl h-64"></div>
      </div>
    </div>
  );
}
