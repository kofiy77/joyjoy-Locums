import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function MinimalUsersList() {
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/admin/users"],
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    console.log('🔍 MINIMAL: Users query result:', { users, isLoading, error });
  }, [users, isLoading, error]);

  if (isLoading) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Minimal Users List</h2>
        <div>Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Minimal Users List</h2>
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  if (!users || !Array.isArray(users)) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Minimal Users List</h2>
        <div className="text-yellow-600">
          No users data received. Data type: {typeof users}
          <br />
          Raw data: {JSON.stringify(users)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Minimal Users List</h2>
      <div className="mb-4 text-green-600">
        Successfully loaded {users.length} users
      </div>
      
      <div className="space-y-4">
        {users.map((user: any, index: number) => (
          <div key={user.id || index} className="border p-3 rounded">
            <div className="font-semibold">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-600">
              Email: {user.email}
            </div>
            <div className="text-sm text-gray-600">
              Type: {user.user_type}
            </div>
            <div className="text-sm text-gray-600">
              Status: {user.registration_status}
            </div>
            <div className="text-sm text-gray-600">
              Active: {user.is_active ? 'Yes' : 'No'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}