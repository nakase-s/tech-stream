-- Insert 'Subscription' keyword with Gold color based on keyword unique constraint
insert into search_keywords (keyword, color)
values ('Subscription', '#FFD700')
on conflict (keyword) 
do update set color = '#FFD700';
