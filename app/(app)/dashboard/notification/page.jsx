'use client'
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@/components/Pagination";
import NotificationDetail from "@/components/notificationDetail";
import { useRouter } from "next/navigation";
import axios from 'axios';

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [dataToDelete, setDataToDelete] = useState(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [notifications, setNotifications] = useState([]);
  const userId = "USR0024"; 

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/notifications/${userId}`);
        setNotifications(response.data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    markNotificationAsRead(notification.id);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:8000/notifications/${notificationId}/read`);
      setNotifications(prevNotifications =>
        prevNotifications.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleBack = () => {
    setSelectedNotification(null);
  };

  const handleDelete = () => {
    if (dataToDelete) {
      setNotifications(notifications.filter(n => n.id !== dataToDelete.id));
      setDeleteWarningOpen(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <div className="bg-slate-100 w-screen min-h-screen py-12 px-4 lg:px-32 pb-32">
        {selectedNotification ? (
          <NotificationDetail notification={selectedNotification} onBack={handleBack} />
        ) : (
          <div className="bg-white p-12 rounded-xl shadow lg:mt-20 md:mt-16 mt-10">
            <h1 className="font-bold mb-8">Notifications</h1>
            <Button variant="button1" onClick={() => router.push("/dashboard")}>
              <FontAwesomeIcon icon={faArrowLeft} />
            </Button>

            <div className="mt-8 rounded-xl overflow-hidden">
              <Table className="min-w-full table-auto border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead className="p-2 bg-[#8BB2B2] text-left text-white">ID</TableHead>
                    <TableHead className="p-2 bg-[#8BB2B2] text-left text-white">Message</TableHead>
                    <TableHead className="p-2 bg-[#8BB2B2] text-center text-white">Date</TableHead>
                    <TableHead className="p-2 bg-[#8BB2B2] text-center text-white">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((notification) => (
                    <TableRow
                      key={notification.id}
                      className={`border-b hover:bg-gray-100 transition-colors cursor-pointer ${notification.read ? 'opacity-50' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <TableCell className="p-2">{notification.id}</TableCell>
                      <TableCell className="p-2">{notification.message}</TableCell>
                      <TableCell className="p-2 text-center">{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="p-2 text-center">
                        <Button
                          variant="destructive"
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDataToDelete(notification);
                            setDeleteWarningOpen(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={notifications.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
