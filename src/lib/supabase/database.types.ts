export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          name: string
          owner_id: string
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          icon?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lists: {
        Row: {
          id: string
          name: string
          board_id: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          board_id: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          board_id?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          description: string | null
          board_id: string
          list_id: string
          position: number
          cover_image_url: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          board_id: string
          list_id: string
          position: number
          cover_image_url?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          board_id?: string
          list_id?: string
          position?: number
          cover_image_url?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          name: string
          color: string
          board_id: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          board_id?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          board_id?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      card_labels: {
        Row: {
          card_id: string
          label_id: string
        }
        Insert: {
          card_id: string
          label_id: string
        }
        Update: never
      }
    }
  }
}
