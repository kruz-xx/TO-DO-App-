from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Todo

class TodoAPITests(APITestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title="Buy groceries",
            description="Milk, eggs, and bread",
            priority="high"
        )
        self.list_create_url = reverse('todo-list')
        self.detail_url = reverse('todo-detail', kwargs={'pk': self.todo.id})

    def test_create_todo(self):
        data = {
            "title": "Clean the room",
            "description": "Vacuum and dust",
            "priority": "low",
            "completed": False
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Todo.objects.count(), 2)
        self.assertEqual(Todo.objects.get(id=response.data['id']).title, "Clean the room")

    def test_list_todos(self):
        response = self.client.get(self.list_create_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Returns list/array directly or in a paginated results depending on settings
        # Here we don't have pagination enabled, so it should be a list
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Buy groceries")

    def test_get_todo_detail(self):
        response = self.client.get(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Buy groceries")

    def test_update_todo(self):
        data = {
            "title": "Buy organic groceries",
            "completed": True,
            "priority": "high"
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, "Buy organic groceries")
        self.assertTrue(self.todo.completed)

    def test_delete_todo(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Todo.objects.count(), 0)
