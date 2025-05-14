import { Component } from '@angular/core';
import axios from 'axios';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  query: string = '';
  isLoading: boolean = false;
  selectedImage: string | null = null;

  messages: { sender: 'user' | 'bot'; text?: string; image_url?: string }[] = [];

  async sendMessage() {
    if (!this.query.trim()) return;

    //const userMessage = { sender: 'user', text: this.query };
    const userMessage: { sender: 'user'; text: string } = { sender: 'user', text: this.query };
    this.messages.push(userMessage);
    this.isLoading = true;

    try {
      const url = `${environment.azureFunctionBaseUrl}/OCM_Tool_Trigger1`;
      const response = await axios.post(url, { query: this.query }, {
        headers: { 'Content-Type': 'application/json' },
        params: {
          code: environment.azureFunctionCode
        }
      });

      const { text_steps, image_results } = response.data;

      if (text_steps) {
        this.messages.push({ sender: 'bot', text: text_steps });
      }

      if (Array.isArray(image_results)) {
        for (const img of image_results) {
          if (img.image_url) {
            this.messages.push({ sender: 'bot', image_url: img.image_url });
          }
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error';
      this.messages.push({ sender: 'bot', text: 'Error occurred: ' + errorMessage });
    } finally {
      this.isLoading = false;
      this.query = '';
    }
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }
}