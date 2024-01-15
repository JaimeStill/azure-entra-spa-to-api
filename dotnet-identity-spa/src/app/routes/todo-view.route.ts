import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { TodoService } from '../services';
import { Todo } from '../models';
import { RouterLink } from '@angular/router';
import { FlexModule } from '../flex';

@Component({
    selector: 'todo-view-route',
    standalone: true,
    styleUrl: 'todo-view.route.scss',
    templateUrl: 'todo-view.route.html',
    imports: [
        FlexModule,
        FormsModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatInputModule,
        MatTableModule,
        RouterLink
    ]
})
export class TodoViewRoute implements OnInit {
    columns = ['status', 'description', 'edit', 'remove'];

    todo: Todo = <Todo>{
        status: false,
        description: ''
    };

    todos: Todo[] = [];

    constructor(
        private api: TodoService
    ) { }

    ngOnInit(): void {
        this.getTodos();
    }

    getTodos(): void {
        this.api
            .getTodos()
            .subscribe((todos: Todo[]) =>
                this.todos = todos
            );
    }

    addTodo(add: NgForm): void {
        this.api
            .postTodo(add.value)
            .subscribe(() =>
                this.getTodos()
            );

        add.resetForm();
    }

    checkTodo(todo: Todo): void {
        this.api
            .editTodo(todo)
            .subscribe();
    }

    removeTodo(id: string): void {
        this.api
            .deleteTodo(+id)
            .subscribe(() =>
                this.getTodos()
            );
    }
}
