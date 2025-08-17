 'use client';

import React, { useEffect, useState } from 'react';
import { userService, type CurrentUserResponse } from './UserService';
import { Role } from './types';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const MyPage: React.FC = () => {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await userService.getCurrentUser();
      
      if (userData) {
        setUser(userData);
      } else {
        setError('사용자 정보를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('사용자 정보 로드 실패:', err);
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logout();
      setUser(null);
      toast.success('로그아웃되었습니다.');
      router.push('/login');
    } catch (err) {
      console.error('로그아웃 실패:', err);
      toast.error('로그아웃 중 오류가 발생했습니다.');
    }
  };

  const handleRefreshToken = async () => {
    try {
      await userService.refreshToken();
      toast.success('토큰이 갱신되었습니다.');
      await loadUserData(); // 사용자 정보 다시 로드
    } catch (err) {
      console.error('토큰 갱신 실패:', err);
      toast.error('토큰 갱신에 실패했습니다.');
    }
  };

  const getRoleDisplayName = (role: Role): string => {
    switch (role) {
      case 'ADMIN':
        return '관리자';
      case 'USER':
        return '일반 사용자';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">오류 발생</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadUserData} className="w-full">
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>마이페이지를 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/login'} className="w-full">
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                 <AvatarImage src="" alt={user.email} />
                <AvatarFallback className="text-lg">
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">마이페이지</CardTitle>
                <CardDescription>사용자 정보 및 설정</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">이메일</h3>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">사용자 ID</h3>
                   <p className="text-lg font-semibold">{user.id}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">권한</h3>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       {getRoleDisplayName(user.role as Role)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">계정 상태</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">활성</span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">마지막 로그인</h3>
                  <p className="text-sm text-gray-600">방금 전</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">계정 생성일</h3>
                  <p className="text-sm text-gray-600">정보 없음</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={loadUserData}
                className="flex-1"
              >
                정보 새로고침
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefreshToken}
                className="flex-1"
              >
                토큰 갱신
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex-1"
              >
                로그아웃
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyPage;
